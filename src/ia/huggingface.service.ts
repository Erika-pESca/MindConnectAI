import { Injectable, Logger } from '@nestjs/common';
import { IaResponse } from './dto/ia-response.interface';
import { Sentimiento } from 'src/message/enums/sentimiento.enum';
import { NivelUrgencia } from 'src/message/enums/nivel-urgencia.enum';

@Injectable()
export class HuggingFaceService {
  private readonly logger = new Logger(HuggingFaceService.name);

  async analizarSentimiento(texto: string): Promise<IaResponse> {
    this.logger.debug(
      'Integración con Hugging Face deshabilitada; usando heurística local.',
    );
    return this.analisisFallback(texto);
  }

  private analisisFallback(texto: string): IaResponse {
    const lower = texto.toLowerCase();

    if (
      lower.includes('triste') ||
      lower.includes('ansioso') ||
      lower.includes('mal') ||
      lower.includes('ayuda')
    ) {
      return {
        sentimiento: Sentimiento.NEGATIVO,
        nivel_urgencia: NivelUrgencia.ALTA,
        puntaje_urgencia: 3,
        emoji_reaccion: '😢',
        respuesta: '',
      };
    }

    if (
      lower.includes('feliz') ||
      lower.includes('agradecido') ||
      lower.includes('maravilloso') ||
      lower.includes('bien')
    ) {
      return {
        sentimiento: Sentimiento.POSITIVO,
        nivel_urgencia: NivelUrgencia.BAJA,
        puntaje_urgencia: 1,
        emoji_reaccion: '😊',
        respuesta: '',
      };
    }

    return {
      sentimiento: Sentimiento.NEUTRAL,
      nivel_urgencia: NivelUrgencia.NORMAL,
      puntaje_urgencia: 2,
      emoji_reaccion: null,
      respuesta: '',
    };
  }
}
