import { Injectable, Logger } from '@nestjs/common';
import { TinyLlamaService } from './tinyllama.service';
import { GroqService } from './groq.service';
import { IaResponse } from './dto/ia-response.interface';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);

  constructor(
    private tinyllama: TinyLlamaService,
    private groq: GroqService,
  ) {}

  /**
   * Genera respuesta y análisis usando Groq primero, con fallback al sistema conversacional
   */
  async generarRespuestaYAnalisis(texto: string): Promise<IaResponse> {
    // 1. Intentar con Groq primero (mejor calidad)
    if (this.groq.isAvailable()) {
      try {
        this.logger.debug('Intentando generar respuesta con Groq...');
        const respuesta = await this.groq.generarRespuesta(texto);
        this.logger.debug('✅ Respuesta generada exitosamente con Groq');
        return respuesta;
      } catch (error) {
        this.logger.warn(`Error con Groq, usando fallback: ${error.message}`);
        // Continuar con fallback
      }
    } else {
      this.logger.debug('Groq no disponible, usando sistema conversacional');
    }

    // 2. Fallback al sistema conversacional mejorado
    this.logger.debug('Usando sistema conversacional como fallback');
    return await this.tinyllama.generarRespuesta(texto);
  }
}

