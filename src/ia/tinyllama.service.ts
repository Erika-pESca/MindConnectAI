import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IaResponse } from './dto/ia-response.interface';
import { Sentimiento } from 'src/message/enums/sentimiento.enum';
import { NivelUrgencia } from 'src/message/enums/nivel-urgencia.enum';

@Injectable()
export class TinyLlamaService {
  private readonly logger = new Logger(TinyLlamaService.name);
  private readonly ollamaUrl =
    process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';

  async generarRespuesta(texto: string): Promise<IaResponse> {
    const prompt = `
      Tu tarea es actuar como un psicólogo virtual. Primero, analiza el sentimiento del siguiente mensaje y clasifícalo como 'positivo', 'negativo' o 'neutral'. Segundo, escribe una respuesta empática y un consejo útil basado en el sentimiento que detectaste. Devuelve tu resultado final únicamente en formato JSON, así:
      {"sentimiento": "<tu_analisis>", "respuesta": "<tu_consejo>"}

      Mensaje del usuario: "${texto}"
    `;

    try {
      const response = await axios.post(this.ollamaUrl, {
        model: 'tinyllama',
        messages: [{ role: 'user', content: prompt }],
        format: 'json',
        stream: false,
      });

      const content = response.data.message.content;
      const parsedContent: { sentimiento: string; respuesta: string } =
        JSON.parse(content);

      // Convertir el string de sentimiento al enum correspondiente
      let sentimientoEnum: Sentimiento;
      switch (parsedContent.sentimiento.toLowerCase()) {
        case 'positivo':
          sentimientoEnum = Sentimiento.POSITIVO;
          break;
        case 'negativo':
          sentimientoEnum = Sentimiento.NEGATIVO;
          break;
        default:
          sentimientoEnum = Sentimiento.NEUTRAL;
          break;
      }

      return {
        sentimiento: sentimientoEnum,
        respuesta: parsedContent.respuesta,
        nivel_urgencia: NivelUrgencia.BAJA, // Puedes desarrollar esto más
        puntaje_urgencia: 0,
        emoji_reaccion: null,
      };
    } catch (error) {
      this.logger.error('Error contactando a Ollama', error.stack);
      // Fallback en caso de que Ollama falle
      return {
        sentimiento: Sentimiento.NEUTRAL,
        respuesta:
          'Lo siento, estoy teniendo problemas para procesar tu solicitud en este momento. Por favor, intenta de nuevo más tarde.',
        nivel_urgencia: NivelUrgencia.BAJA,
        puntaje_urgencia: 0,
        emoji_reaccion: null,
      };
    }
  }

  async analyzeAndRespond(userMessage: string): Promise<{ sentiment: string; response: string }> {
    const prompt = `
      Analiza el sentimiento del siguiente mensaje de un usuario que busca apoyo emocional
      y luego genera una respuesta empática y útil.
      El sentimiento debe ser uno de: 'positivo', 'negativo', 'neutro', 'urgente'.
      Devuelve tu análisis únicamente en formato JSON con las claves "sentiment" y "response".

      Mensaje del usuario: "${userMessage}"

      JSON de respuesta:
    `;

    // Suponiendo que tienes un método `generate` que envía el prompt al modelo
    const modelOutput = await this.generate(prompt);

    try {
      // El modelo debería devolver un string JSON, así que lo parseamos
      const parsedOutput = JSON.parse(modelOutput);
      return {
        sentiment: parsedOutput.sentiment || 'desconocido',
        response: parsedOutput.response || 'No he podido procesar tu mensaje, intenta de nuevo.',
      };
    } catch (error) {
      console.error('Error al parsear la respuesta de la IA:', modelOutput);
      // Fallback por si la IA no devuelve un JSON válido
      return {
        sentiment: 'desconocido',
        response: 'Estoy teniendo problemas para responder en este momento. Por favor, intenta más tarde.',
      };
    }
  }

  // Un método de ejemplo para `generate`
  private async generate(prompt: string): Promise<string> {
    // Aquí iría tu lógica para hacer la llamada a la API de TinyLlama
    // por ejemplo, usando fetch o una librería como axios.
    // const response = await fetch('URL_DE_TINYLLAMA', { ... });
    // const data = await response.json();
    // return data.choices[0].text;
    
    // Esto es un mock para el ejemplo
    console.log("Enviando prompt a TinyLlama:", prompt);
    const mockResponse = {
        sentiment: "negativo",
        response: "Lamento escuchar que te sientes así. Recuerda que está bien no estar bien. ¿Hay algo específico sobre lo que te gustaría hablar?"
    };
    return JSON.stringify(mockResponse);
  }
}
