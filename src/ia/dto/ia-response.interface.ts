import { Sentimiento } from 'src/message/enums/sentimiento.enum';
import { NivelUrgencia } from 'src/message/enums/nivel-urgencia.enum';

export interface IaResponse {
  sentimiento: Sentimiento;
  nivel_urgencia: NivelUrgencia;
  puntaje_urgencia: number;
  emoji_reaccion: string | null;
  respuesta: string;
}
