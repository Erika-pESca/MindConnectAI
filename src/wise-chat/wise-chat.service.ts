import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WiseChat } from './entities/wise-chat.entity';
import { Historial } from '../historial/entities/historial.entity';
import { CreateWiseChatDto } from './dto/create-wise-chat.dto';
import { UpdateWiseChatDto } from './dto/update-wise-chat.dto';
import { TinyLlamaService } from '../ia/tinyllama.service';
import { MessageService } from '../message/message.service';
import { Message } from '../message/entities/message.entity';

@Injectable()
export class WiseChatService {
  constructor(
    @InjectRepository(WiseChat)
    private readonly wiseChatRepository: Repository<WiseChat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Historial)
    private readonly historialRepo: Repository<Historial>,
    private readonly tinyLlamaService: TinyLlamaService,
    private readonly messageService: MessageService,
  ) {}

  /**
   * Crear un nuevo chat sabio
   */
  async crearChat(userId: string, dto: CreateWiseChatDto) {
    const uid = Number(userId);

    // 1. Buscar el historial del usuario
    let historial = await this.historialRepo.findOne({
      where: { user: { id: uid } },
      relations: ['user'],
    });

    // 2. Si no existe, se crea uno nuevo
    if (!historial) {
      historial = this.historialRepo.create({
        user: { id: uid },
      });

      historial = await this.historialRepo.save(historial);
    }

    // 3. Crear el chat
    const chat = this.wiseChatRepository.create({
      nombre_chat: dto.nombre_chat,
      descripcion: dto.descripcion ?? null,
      sentimiento_general: 'neutro',
      nivel_urgencia_general: 'baja',
      historial: historial,
    });

    return await this.wiseChatRepository.save(chat);
  }

  /**
   * Obtener un chat por su ID
   */
  async obtenerChat(id: number) {
    const chat = await this.wiseChatRepository.findOne({
      where: { id },
      relations: ['messages', 'notifications', 'historial'],
      order: {
        messages: {
          creation_date: 'ASC',
        },
      },
    });

    if (!chat) {
      throw new NotFoundException(`Chat con ID ${id} no encontrado`);
    }

    return chat;
  }

  async processMessageWithIA(data: { message: string; userId: number }) {
    // Aquí puedes guardar el mensaje del usuario en la base de datos si quieres
    // await this.messageService.create({ ... });

    // Llama al servicio de IA para obtener el análisis y la respuesta
    const iaResult = await this.tinyLlamaService.analyzeAndRespond(
      data.message,
    );

    // Aquí también puedes guardar la respuesta de la IA en la base de datos
    // await this.messageService.create({ ... });

    return {
      user: 'IA',
      text: iaResult.response,
      sentiment: iaResult.sentiment,
      timestamp: new Date(),
    };
  }
}
