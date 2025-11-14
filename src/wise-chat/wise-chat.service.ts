import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WiseChat } from '../wise-chat/entities/wise-chat.entity';
import { Message } from '../message/entities/message.entity';
import { Historial } from '../historial/entities/historial.entity';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WiseChatService {
  private readonly apiUrl = 'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english';

  constructor(
    @InjectRepository(WiseChat) private wiseChatRepo: Repository<WiseChat>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(Historial) private historialRepo: Repository<Historial>,
    private readonly httpService: HttpService,
  ) {}

  // Crear un nuevo chat
  async createChat(name: string, description?: string) {
    const chat = this.wiseChatRepo.create({ name, description });
    return this.wiseChatRepo.save(chat);
  }

  // Enviar mensaje y analizar sentimiento
  async sendMessage(userId: number, wiseChatId: number, content: string) {
    // Guardar mensaje
    const message = this.messageRepo.create({
      user: { id: userId },
      wiseChat: { id: wiseChatId },
      content,
    });
    await this.messageRepo.save(message);

    // Analizar sentimiento con Hugging Face
    const headers = {
      Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    };

    const response = await firstValueFrom(
      this.httpService.post(this.apiUrl, { inputs: content }, { headers }),
    );

    const sentiment = response.data[0]?.label || 'UNKNOWN';

    // Guardar en historial
    const historial = this.historialRepo.create({
      user: { id: userId },
      wiseChat: { id: wiseChatId },
      content_message: content,
      sentiment,
      urgency_level: sentiment === 'NEGATIVE' ? 'alta' : 'normal',
    });
    await this.historialRepo.save(historial);

    return { message: 'Mensaje procesado', sentiment };
  }

  async getChatHistory(wiseChatId: number) {
    return this.historialRepo.find({
      where: { wiseChat: { id: wiseChatId } },
      relations: ['user'],
    });
  }
}
