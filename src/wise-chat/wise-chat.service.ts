import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WiseChat } from './entities/wise-chat.entity';
import { Message } from '../message/entities/message.entity';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WiseChatService {
  private readonly logger = new Logger(WiseChatService.name);

  constructor(
    @InjectRepository(WiseChat) private wiseChatRepo: Repository<WiseChat>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Crear un nuevo chat
  async createChat(name: string, description?: string): Promise<WiseChat> {
    const chat = this.wiseChatRepo.create({ name, description });
    return this.wiseChatRepo.save(chat);
  }

  // Enviar mensaje, analizar sentimiento y actualizar el chat
  async sendMessage(userId: number, wiseChatId: number, content: string) {
    const wiseChat = await this.wiseChatRepo.findOneBy({ id: wiseChatId });
    if (!wiseChat) {
      throw new NotFoundException(`WiseChat with ID ${wiseChatId} not found`);
    }

    // 1. Guardar el mensaje
    const message = this.messageRepo.create({
      content,
      wiseChat: { id: wiseChatId },
      user: { id: userId },
    });
    await this.messageRepo.save(message);

    // 2. Analizar sentimiento con Hugging Face
    const sentiment = await this.analyzeSentiment(content);

    // 3. Actualizar el WiseChat con el nuevo sentimiento y urgencia
    wiseChat.sentiment = sentiment;
    wiseChat.urgency_level = sentiment === 'NEGATIVE' ? 'alta' : 'normal';
    await this.wiseChatRepo.save(wiseChat);

    return {
      message: 'Mensaje procesado y chat actualizado',
      sentiment: wiseChat.sentiment,
      urgency_level: wiseChat.urgency_level,
    };
  }

  private async analyzeSentiment(text: string): Promise<string> {
    const apiUrl = this.configService.get<string>('HUGGINGFACE_API_URL');
    const apiKey = this.configService.get<string>('HUGGINGFACE_API_KEY');

    if (!apiUrl || !apiKey) {
      throw new HttpException(
        'Hugging Face API URL or Key not configured.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const headers = { Authorization: `Bearer ${apiKey}` };

    try {
      const response = await firstValueFrom(
        this.httpService.post(apiUrl, { inputs: text }, { headers }),
      );

      // Navegación segura a través de la respuesta de la API
      const sentimentResult = response.data?.[0]?.[0]?.label;
      if (!sentimentResult) {
        this.logger.warn('Sentiment analysis returned an unexpected structure', response.data);
        return 'UNKNOWN';
      }
      return sentimentResult;
    } catch (error) {
      this.logger.error('Error calling Hugging Face API', error.stack);
      throw new HttpException(
        'Failed to analyze sentiment.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // Obtener el historial de mensajes de un chat específico
  async getChatHistory(wiseChatId: number): Promise<Message[]> {
    return this.messageRepo.find({
      where: { wiseChat: { id: wiseChatId } },
      relations: ['user'],
      order: { creation_date: 'ASC' },
    });
  }
}
