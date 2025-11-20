import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sentimiento } from '../message/enums/sentimiento.enum';
import { NivelUrgencia } from '../message/enums/nivel-urgencia.enum';
import { IaResponse } from './dto/ia-response.interface';

// Intentar importar dinámicamente Xenova solo si es necesario para evitar errores en build si no está instalado
// Pero para este ejemplo usaremos una implementación mock/básica para que compile.
// En producción real, aquí iría la lógica de @xenova/transformers.

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);

  constructor(private readonly configService: ConfigService) {}

  async analizarSentimiento(texto: string): Promise<IaResponse> {
    this.logger.log(`Analizando texto: ${texto}`);
    
    // MOCK: Lógica simple para demostración
    // En el futuro, reemplazar con llamada a API externa o modelo local
    const lowerText = texto.toLowerCase();
    
    let sentimiento = Sentimiento.NEUTRAL;
    let urgencia = NivelUrgencia.BAJA;
    let puntaje = 0;
    let emoji = '😐';

    if (lowerText.includes('ayuda') || lowerText.includes('urgente') || lowerText.includes('error')) {
      urgencia = NivelUrgencia.ALTA;
      puntaje = 3;
      emoji = '🚨';
      sentimiento = Sentimiento.NEGATIVO;
    } else if (lowerText.includes('gracias') || lowerText.includes('bueno') || lowerText.includes('excelente')) {
      sentimiento = Sentimiento.POSITIVO;
      emoji = '😊';
    } else if (lowerText.includes('triste') || lowerText.includes('malo')) {
      sentimiento = Sentimiento.NEGATIVO;
      emoji = '😢';
    }

    return {
      sentimiento,
      nivel_urgencia: urgencia,
      puntaje_urgencia: puntaje,
      emoji_reaccion: emoji,
      respuesta: '', // Se llenará en generarRespuesta
    };
  }

  async generarRespuesta(texto: string, analisisPrevio: IaResponse): Promise<IaResponse> {
    // Simulación de respuesta generativa
    let respuesta = 'Entiendo, cuéntame más.';

    if (analisisPrevio.sentimiento === Sentimiento.POSITIVO) {
      respuesta = '¡Me alegra escuchar eso! ¿En qué más puedo ayudarte?';
    } else if (analisisPrevio.nivel_urgencia === NivelUrgencia.ALTA) {
      respuesta = 'Entendido, esto parece urgente. Un agente humano revisará tu caso pronto.';
    } else if (analisisPrevio.sentimiento === Sentimiento.NEGATIVO) {
        respuesta = 'Lamento escuchar eso. Trataremos de mejorar tu experiencia.';
    }

    return {
      ...analisisPrevio,
      respuesta,
    };
  }
}

