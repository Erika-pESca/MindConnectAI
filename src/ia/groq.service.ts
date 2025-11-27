import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { IaResponse } from './dto/ia-response.interface';
import { Sentimiento } from 'src/message/enums/sentimiento.enum';
import { NivelUrgencia } from 'src/message/enums/nivel-urgencia.enum';

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly apiKey: string;
  private readonly baseURL = 'https://api.groq.com/openai/v1';
  private readonly httpClient: AxiosInstance;
  private readonly model = 'llama-3.1-8b-instant'; // Modelo gratuito y rápido (cambiar a llama-3.1-70b-versatile si está disponible)

  constructor(private readonly configService: ConfigService) {
    // Usar ConfigService para cargar la variable de entorno correctamente
    const keyFromConfig = this.configService.get<string>('GROQ_API_KEY');
    const keyFromEnv = process.env.GROQ_API_KEY;
    
    this.apiKey = (keyFromConfig || keyFromEnv || '').trim();
    
    // Log de diagnóstico detallado
    this.logger.log(`🔍 Diagnóstico de GROQ_API_KEY:`);
    this.logger.log(`   - Desde ConfigService: ${keyFromConfig ? `${keyFromConfig.substring(0, 4)}...` : 'NO'}`);
    this.logger.log(`   - Desde process.env: ${keyFromEnv ? `${keyFromEnv.substring(0, 4)}...` : 'NO'}`);
    this.logger.log(`   - Key final (trimmed): ${this.apiKey ? `${this.apiKey.substring(0, 4)}...${this.apiKey.substring(this.apiKey.length - 4)}` : 'VACÍA'}`);
    this.logger.log(`   - Longitud: ${this.apiKey.length} caracteres`);
    
    if (this.apiKey && this.apiKey.length > 0) {
      this.logger.log(`✅ GROQ_API_KEY cargada correctamente`);
    } else {
      this.logger.warn('⚠️ GROQ_API_KEY no configurada. Groq API no estará disponible.');
    }

    this.httpClient = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 segundos timeout
    });
  }

  /**
   * Verifica si Groq está disponible
   */
  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Genera una respuesta usando Groq API
   */
  async generarRespuesta(texto: string): Promise<IaResponse> {
    if (!this.isAvailable()) {
      throw new Error('Groq API no está disponible. Configura GROQ_API_KEY en .env');
    }

    try {
      this.logger.debug(`Generando respuesta con Groq para: "${texto.substring(0, 50)}..."`);

      // Analizar sentimiento primero
      const sentimiento = this.analyzeSentimiento(texto);

      // Crear prompt optimizado para respuestas empáticas y útiles
      const prompt = this.crearPrompt(texto, sentimiento);

      // Validar que la API key no esté vacía antes de hacer la petición
      if (!this.apiKey || this.apiKey.trim().length === 0) {
        throw new Error('GROQ_API_KEY está vacía o no es válida');
      }

      // Llamar a Groq API
      const response = await this.httpClient.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente virtual empático y profesional especializado en apoyo emocional y consejería. Tu objetivo es ayudar a las personas a procesar sus emociones y sentirse escuchadas. Responde de manera natural, comprensiva y útil. Si el usuario menciona problemas específicos (como peleas, conflictos, ansiedad, tristeza, falta de motivación), ofrece apoyo emocional genuino y consejos prácticos cuando sea apropiado. Sé empático, valida sus sentimientos y muestra comprensión. Responde en español de manera conversacional y cálida (2-4 oraciones).',
          },
          {
            role: 'user',
            content: texto, // Usar el texto original directamente
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9,
      });

      const respuestaGenerada = response.data.choices[0]?.message?.content?.trim() || '';

      if (!respuestaGenerada) {
        throw new Error('Respuesta vacía de Groq API');
      }

      this.logger.debug(`✅ Respuesta generada por Groq: "${respuestaGenerada.substring(0, 100)}..."`);

      return {
        sentimiento,
        respuesta: respuestaGenerada,
        nivel_urgencia: this.getNivelUrgencia(sentimiento),
        puntaje_urgencia: this.getPuntajeUrgencia(sentimiento),
        emoji_reaccion: this.getEmoji(sentimiento),
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Error desconocido';
      const statusCode = error.response?.status;
      
      // Detectar errores de red/conectividad (DNS, timeout, etc.)
      const isNetworkError = error.code === 'ENOTFOUND' || 
                            error.code === 'ECONNREFUSED' || 
                            error.code === 'ETIMEDOUT' ||
                            error.code === 'EAI_AGAIN' ||
                            errorMessage.includes('getaddrinfo') ||
                            errorMessage.includes('ENOTFOUND');
      
      if (isNetworkError) {
        // Error de conectividad - usar fallback silenciosamente
        this.logger.warn(`⚠️ Problema de conectividad con Groq API (${error.code || 'DNS/Network'}): ${errorMessage}`);
        this.logger.debug(`   El sistema usará respuestas predeterminadas. Esto es normal si no hay conexión a internet.`);
        throw new Error('NETWORK_ERROR'); // Error especial que el IaService puede detectar
      }
      
      // Si es un error de rate limit, informar al usuario
      if (statusCode === 429) {
        this.logger.warn(`⚠️ Límite de requests alcanzado en Groq. Usando fallback.`);
        throw new Error('RATE_LIMIT'); // Error especial para rate limit
      }

      // Si es un error de autenticación
      if (statusCode === 401) {
        this.logger.error(`🔴 API key inválida. Verifica que GROQ_API_KEY en .env sea correcta y no tenga espacios extra.`);
        this.logger.error(`   Longitud de la key: ${this.apiKey?.length || 0} caracteres`);
        this.logger.error(`   Primeros 4 caracteres: ${this.apiKey?.substring(0, 4) || 'N/A'}`);
        throw new Error('API key de Groq inválida o expirada. Verifica GROQ_API_KEY en .env y genera una nueva si es necesario.');
      }

      // Otros errores
      this.logger.warn(`⚠️ Error al usar Groq (Status: ${statusCode}): ${errorMessage}`);
      this.logger.debug(`   Usando sistema de respuestas predeterminadas como fallback.`);
      throw error;
    }
  }

  /**
   * Crea un prompt optimizado según el contexto y sentimiento
   */
  private crearPrompt(texto: string, sentimiento: Sentimiento): string {
    const sentimientoTexto = sentimiento === Sentimiento.POSITIVO 
      ? 'positivo' 
      : sentimiento === Sentimiento.NEGATIVO 
      ? 'negativo' 
      : 'neutral';

    let prompt = `El usuario escribió: "${texto}"\n\n`;
    prompt += `Análisis de sentimiento: ${sentimientoTexto}\n\n`;

    if (sentimiento === Sentimiento.NEGATIVO) {
      prompt += `El usuario está pasando por un momento difícil. Responde de manera empática, comprensiva y ofrece apoyo emocional. Si menciona problemas específicos, ofrece consejos prácticos o alternativas concretas. `;
    } else if (sentimiento === Sentimiento.POSITIVO) {
      prompt += `El usuario está teniendo un momento positivo. Responde de manera alegre y celebratoria. `;
    }

    prompt += `Responde de manera natural y conversacional, como lo haría un amigo cercano o consejero de confianza. Sé conciso pero útil (2-4 oraciones).`;

    return prompt;
  }

  /**
   * Analiza el sentimiento del texto
   */
  private analyzeSentimiento(texto: string): Sentimiento {
    const lower = texto.toLowerCase();
    const palabrasNegativas = [
      'triste',
      'mal',
      'ansioso',
      'deprimido',
      'preocupado',
      'miedo',
      'solo',
      'ayuda',
      'problema',
      'difícil',
      'frustrado',
      'pelea',
      'conflicto',
    ];
    const palabrasPositivas = [
      'feliz',
      'bien',
      'agradecido',
      'contento',
      'genial',
      'maravilloso',
      'excelente',
    ];

    const hasNegativo = palabrasNegativas.some((palabra) =>
      lower.includes(palabra),
    );
    const hasPositivo = palabrasPositivas.some((palabra) =>
      lower.includes(palabra),
    );

    if (hasNegativo && !hasPositivo) return Sentimiento.NEGATIVO;
    if (hasPositivo && !hasNegativo) return Sentimiento.POSITIVO;
    return Sentimiento.NEUTRAL;
  }

  private getNivelUrgencia(sentimiento: Sentimiento): NivelUrgencia {
    switch (sentimiento) {
      case Sentimiento.NEGATIVO:
        return NivelUrgencia.ALTA;
      case Sentimiento.POSITIVO:
        return NivelUrgencia.BAJA;
      default:
        return NivelUrgencia.NORMAL;
    }
  }

  private getPuntajeUrgencia(sentimiento: Sentimiento): number {
    switch (sentimiento) {
      case Sentimiento.NEGATIVO:
        return 3;
      case Sentimiento.POSITIVO:
        return 1;
      default:
        return 2;
    }
  }

  private getEmoji(sentimiento: Sentimiento): string | undefined {
    switch (sentimiento) {
      case Sentimiento.NEGATIVO:
        return '😢';
      case Sentimiento.POSITIVO:
        return '😊';
      default:
        return undefined;
    }
  }
}

