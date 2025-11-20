import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WiseChat } from './entities/wise-chat.entity';
import { Historial } from '../historial/entities/historial.entity';
<<<<<<< HEAD
import { firstValueFrom } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
=======
import { CreateWiseChatDto } from './dto/create-wise-chat.dto';
import { UpdateWiseChatDto } from './dto/update-wise-chat.dto';
import { TinyLlamaService } from '../ia/tinyllama.service';
import { MessageService } from '../message/message.service';
import { Message } from '../message/entities/message.entity';
>>>>>>> 34cf1efa500f9f9c7cd6ced6cc8070bb18c865fe

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

<<<<<<< HEAD
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
   // Guardar en historial
const historial = this.historialRepo.create({
  user: { id: userId },
  wiseChats: [{ id: wiseChatId }],
});

await this.historialRepo.save(historial);

return { message: 'Mensaje procesado', sentiment };

  }

  async getChatHistory(wiseChatId: number) {
  const chat = await this.wiseChatRepo.findOne({
    where: { id: wiseChatId },
    relations: ['historial', 'historial.user'],
  });
  if (!chat) {
    throw new NotFoundException(`Chat con id ${wiseChatId} no encontrado`);
=======
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

  /**
   * Obtener todos los chats de un usuario específico
   */
  async findAllByUser(userId: number) {
    return this.wiseChatRepository.find({
      where: {
        historial: {
          user: { id: userId },
        },
      },
      order: {
        fecha_creacion: 'DESC', // Los más recientes primero
      },
    });
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
>>>>>>> 34cf1efa500f9f9c7cd6ced6cc8070bb18c865fe
  }

  return chat.historial;
}
}
