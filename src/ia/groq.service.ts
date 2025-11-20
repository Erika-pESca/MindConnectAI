import { Injectable, Logger } from '@nestjs/common';
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

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    
    if (!this.apiKey) {
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

      // Llamar a Groq API
      const response = await this.httpClient.post('/chat/completions', {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente virtual empático y profesional especializado en apoyo emocional y consejería. Responde de manera natural, comprensiva y útil. Si el usuario tiene problemas, ofrece consejos prácticos y alternativas concretas. Sé conciso pero útil (2-4 oraciones).',
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
      this.logger.error('Error al generar respuesta con Groq:', error.message);
      
      // Si es un error de rate limit, informar al usuario
      if (error.response?.status === 429) {
        throw new Error('Límite de requests alcanzado. Por favor, intenta de nuevo en un momento.');
      }

      // Si es un error de autenticación
      if (error.response?.status === 401) {
        throw new Error('API key de Groq inválida. Verifica GROQ_API_KEY en .env');
      }

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

  private getEmoji(sentimiento: Sentimiento): string | null {
    switch (sentimiento) {
      case Sentimiento.NEGATIVO:
        return '😢';
      case Sentimiento.POSITIVO:
        return '😊';
      default:
        return null;
    }
  }
}

