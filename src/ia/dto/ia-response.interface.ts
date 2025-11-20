import { Sentimiento } from '../../message/enums/sentimiento.enum';
import { NivelUrgencia } from '../../message/enums/nivel-urgencia.enum';

export interface IaResponse {
  sentimiento: Sentimiento;
  nivel_urgencia: NivelUrgencia;
  puntaje_urgencia: number;
  emoji_reaccion?: string;
  respuesta: string;
}

