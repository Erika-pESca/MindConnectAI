import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sentimiento } from '../message/enums/sentimiento.enum';
import { NivelUrgencia } from '../message/enums/nivel-urgencia.enum';
import { IaResponse } from './dto/ia-response.interface';
import { GroqService } from './groq.service';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly groqService: GroqService,
  ) {}

  async analizarSentimiento(texto: string): Promise<IaResponse> {
    this.logger.log(`Analizando texto: ${texto}`);
    
    // Sistema básico de análisis (rápido y ligero)
    // NO llamamos a Groq aquí para evitar llamadas duplicadas
    // Groq se usará solo en generarRespuesta si está disponible
    const lowerText = texto.toLowerCase();
    
    let sentimiento = Sentimiento.NEUTRAL;
    let urgencia = NivelUrgencia.BAJA;
    let puntaje = 0;
    let emoji: string | undefined = undefined;

    // Detección de palabras clave para análisis de sentimiento
    const palabrasNegativas = [
      'triste', 'mal', 'malo', 'ansioso', 'deprimido', 'preocupado', 
      'miedo', 'solo', 'ayuda', 'problema', 'difícil', 'frustrado', 
      'pelea', 'conflicto', 'peleé', 'pelea', 'novio', 'novia', 'discusión'
    ];
    const palabrasPositivas = [
      'feliz', 'bien', 'agradecido', 'contento', 'genial', 
      'maravilloso', 'excelente', 'gracias'
    ];
    const palabrasUrgentes = [
      'urgente', 'emergencia', 'ayuda', 'suicidio', 'lastimarme', 
      'no puedo más', 'desesperado'
    ];

    const hasNegativo = palabrasNegativas.some(palabra => lowerText.includes(palabra));
    const hasPositivo = palabrasPositivas.some(palabra => lowerText.includes(palabra));
    const hasUrgente = palabrasUrgentes.some(palabra => lowerText.includes(palabra));

    if (hasUrgente) {
      // Casos de urgencia alta
      urgencia = NivelUrgencia.ALTA;
      puntaje = 3;
      emoji = '🚨';
      sentimiento = Sentimiento.NEGATIVO;
    } else if (hasNegativo && !hasPositivo) {
      // Sentimientos negativos sin positivos
      sentimiento = Sentimiento.NEGATIVO;
      urgencia = NivelUrgencia.NORMAL;
      puntaje = 2;
      emoji = '😢';
    } else if (hasPositivo && !hasNegativo) {
      // Sentimientos positivos sin negativos
      sentimiento = Sentimiento.POSITIVO;
      urgencia = NivelUrgencia.BAJA;
      puntaje = 1;
      emoji = '😊';
    }
    // Si no hay ninguna coincidencia, se mantiene NEUTRAL (valores por defecto)

    return {
      sentimiento,
      nivel_urgencia: urgencia,
      puntaje_urgencia: puntaje,
      emoji_reaccion: emoji,
      respuesta: '', // Se llenará en generarRespuesta
    };
  }

  async generarRespuesta(texto: string, analisisPrevio: IaResponse): Promise<IaResponse> {
    this.logger.log(`Generando respuesta para: "${texto}"`);
    
    // Intentar usar Groq si está disponible (UNA SOLA LLAMADA)
    if (this.groqService.isAvailable()) {
      try {
        this.logger.log('🤖 Usando Groq API para generar respuesta');
        const groqResponse = await this.groqService.generarRespuesta(texto);
        // Groq ya genera todo el análisis completo con respuesta, así que lo retornamos directamente
        this.logger.log(`✅ Respuesta de Groq: "${groqResponse.respuesta.substring(0, 100)}..."`);
        return groqResponse;
      } catch (error) {
        this.logger.error(`❌ Error al usar Groq: ${error.message}`);
        this.logger.warn(`⚠️ Continuando con sistema básico debido al error de Groq`);
        // Continuar con el sistema básico si Groq falla
      }
    } else {
      this.logger.log('📝 Groq no disponible (GROQ_API_KEY no configurada), usando sistema básico de respuestas');
    }
    
    // Sistema básico de respuestas (fallback)
    const lowerText = texto.toLowerCase().trim();
    
    // Respuestas contextuales basadas en el contenido del mensaje
    let respuesta = '';

    // Saludos
    if (lowerText.match(/^(hola|hi|hey|buenos días|buenas tardes|buenas noches|saludos)/)) {
      respuesta = '¡Hola! 👋 Me alegra que estés aquí. Soy tu asistente de MindConnect AI, un espacio seguro donde puedes compartir lo que sientes. ¿Cómo te sientes hoy?';
    }
    // Preguntas sobre qué hace/hacemos
    else if (lowerText.match(/(qué haces|qué hace|qué es|qué puedo|para qué sirves|qué eres)/)) {
      respuesta = 'Soy tu asistente de salud mental en MindConnect AI. Estoy aquí para escucharte, apoyarte y ayudarte a procesar tus emociones. Puedes contarme lo que sientes sin miedo al juicio. ¿Hay algo específico en lo que te gustaría que te ayude hoy?';
    }
    // Preguntas sobre ayuda
    else if (lowerText.match(/(ayuda|help|necesito ayuda|puedes ayudarme)/)) {
      respuesta = 'Por supuesto, estoy aquí para ayudarte. 🌟 Puedes contarme qué te preocupa o cómo te sientes. Juntos podemos explorar tus emociones y encontrar formas de sentirte mejor. ¿Qué te gustaría compartir?';
    }
    // Expresiones de tristeza o malestar
    else if (lowerText.match(/(triste|mal|malo|deprimido|ansioso|preocupado|miedo|tengo miedo)/)) {
      respuesta = 'Entiendo que estás pasando por un momento difícil. 💜 Es valiente de tu parte compartirlo. No estás solo/a. ¿Te gustaría contarme más sobre cómo te sientes? Estoy aquí para escucharte sin juzgar.';
    }
    // Problemas de relación (peleas, conflictos)
    else if (lowerText.match(/(pelea|peleé|conflicto|discusión|novio|novia|pareja|esposo|esposa|relación|problema con)/)) {
      respuesta = 'Entiendo que estás pasando por un momento difícil en tu relación. 💔 Los conflictos pueden ser muy dolorosos. Es importante comunicarse con calma y escucharse mutuamente. ¿Te gustaría contarme más detalles sobre lo que pasó? A veces hablar sobre ello puede ayudar a procesar las emociones.';
    }
    // Expresiones positivas
    else if (lowerText.match(/(bien|genial|excelente|feliz|contento|mejor|gracias)/)) {
      respuesta = '¡Me alegra mucho saber que te sientes así! 😊 Es importante reconocer y celebrar los momentos positivos. ¿Hay algo específico que te haya hecho sentir bien hoy?';
    }
    // Preguntas sobre sentimientos
    else if (lowerText.match(/(cómo me siento|cómo estoy|qué siento|siento|emociones)/)) {
      respuesta = 'Es normal tener diferentes emociones a lo largo del día. 🌈 A veces puede ser difícil identificarlas. ¿Puedes describir qué sensaciones físicas o pensamientos tienes en este momento? Eso me ayudará a entenderte mejor.';
    }
    // Urgencia o crisis
    else if (analisisPrevio.nivel_urgencia === NivelUrgencia.ALTA || lowerText.match(/(urgente|emergencia|suicidio|lastimarme|no puedo más)/)) {
      respuesta = 'Entiendo que estás pasando por un momento muy difícil. 🚨 Tu bienestar es importante. Si estás en peligro inmediato, por favor contacta a los servicios de emergencia de tu país. También puedes hablar con un profesional de salud mental. ¿Te gustaría que te ayude a encontrar recursos de apoyo?';
    }
    // Preguntas cortas o monosílabos
    else if (lowerText.length <= 5 || lowerText.match(/^(sí|no|ok|vale|claro|bien)$/)) {
      respuesta = 'Entiendo. ¿Te gustaría contarme más sobre lo que estás pensando o sintiendo? Estoy aquí para escucharte. 💙';
    }
    // Mensajes de agradecimiento
    else if (lowerText.match(/(gracias|thank you|te agradezco)/)) {
      respuesta = 'De nada. 😊 Es un honor poder acompañarte en tu proceso. Recuerda que siempre puedes volver aquí cuando lo necesites. ¿Hay algo más en lo que pueda ayudarte?';
    }
    // Respuesta por defecto más empática
    else {
      // Analizar el sentimiento para personalizar la respuesta
      if (analisisPrevio.sentimiento === Sentimiento.POSITIVO) {
        respuesta = `Me alegra escuchar eso. 😊 Veo que estás en un buen momento. ¿Te gustaría compartir más sobre lo que te hace sentir así?`;
      } else if (analisisPrevio.sentimiento === Sentimiento.NEGATIVO) {
        respuesta = `Entiendo que estás pasando por algo difícil. 💜 Es completamente válido sentir lo que sientes. ¿Te gustaría contarme más sobre lo que te está pasando? Estoy aquí para escucharte sin juzgar.`;
      } else {
        respuesta = `Gracias por compartir. 🤗 Estoy aquí para escucharte y apoyarte. ¿Puedes contarme un poco más sobre lo que te preocupa o cómo te sientes?`;
      }
    }

    this.logger.log(`Respuesta generada: "${respuesta}"`);

    return {
      ...analisisPrevio,
      respuesta,
    };
  }
}

