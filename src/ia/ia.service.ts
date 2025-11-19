import { Injectable } from '@nestjs/common';
import { TinyLlamaService } from './tinyllama.service';
import { IaResponse } from './dto/ia-response.interface';

@Injectable()
export class IaService {
  constructor(private tinyllama: TinyLlamaService) {}

  async generarRespuestaYAnalisis(texto: string): Promise<IaResponse> {
    return await this.tinyllama.generarRespuesta(texto);
  }
}

