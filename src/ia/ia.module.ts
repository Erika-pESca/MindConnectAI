import { Module } from '@nestjs/common';
import { HuggingFaceService } from './huggingface.service';
import { TinyLlamaService } from './tinyllama.service';
import { IaService } from './ia.service';

@Module({
  providers: [HuggingFaceService, TinyLlamaService, IaService],
  exports: [TinyLlamaService, IaService],
})
export class IaModule {}
