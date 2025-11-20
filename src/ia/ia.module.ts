import { Module } from '@nestjs/common';
import { IaService } from './ia.service';
import { GroqService } from './groq.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [IaService, GroqService],
  exports: [IaService],
})
export class IaModule {}

