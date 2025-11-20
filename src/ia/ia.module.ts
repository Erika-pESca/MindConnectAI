import { Module } from '@nestjs/common';
import { HuggingFaceService } from './huggingface.service';
import { TinyLlamaService } from './tinyllama.service';
import { GroqService } from './groq.service';
import { IaService } from './ia.service';

@Module({
  providers: [HuggingFaceService, TinyLlamaService, GroqService, IaService],
  exports: [TinyLlamaService, GroqService, IaService],
})
export class IaModule {}
