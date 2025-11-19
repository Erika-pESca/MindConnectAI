import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message } from './entities/message.entity';
import { WiseChat } from '../wise-chat/entities/wise-chat.entity';
import { User } from '../user/entities/user.entity';

import { EstadoMensaje } from './enums/estado-mensaje.enum';
import { Sentimiento } from './enums/sentimiento.enum';
import { NivelUrgencia } from './enums/nivel-urgencia.enum';

import { IaService } from '../ia/ia.service';
import { IaResponse } from '../ia/dto/ia-response.interface';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,

    @InjectRepository(WiseChat)
    private readonly chatRepo: Repository<WiseChat>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly iaService: IaService,
  ) {}

  async crearMensaje(userId: number, chatId: number, contenido: string) {
    // 1. Buscar chat y usuario en paralelo
    const [chat, user] = await Promise.all([
      this.chatRepo.findOne({
        where: { id: chatId },
        relations: ['messages'],
      }),
      this.userRepo.findOneBy({ id: userId }),
    ]);

    // 2. Validar que existan
    if (!chat) throw new NotFoundException('Chat no encontrado');
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 3. Analizar sentimiento y generar respuesta con IA en un solo paso
    const iaResult: IaResponse =
      await this.iaService.generarRespuestaYAnalisis(contenido);

    // 4. Crear mensaje del usuario
    const mensajeUsuario = this.messageRepo.create({
      content: contenido,
      status: EstadoMensaje.ENVIADO,
      wiseChat: chat,
      user: user, // Usar la entidad de usuario completa

      sentimiento: iaResult.sentimiento,
      nivel_urgencia: iaResult.nivel_urgencia,
      puntaje_urgencia: iaResult.puntaje_urgencia,

      isBot: false,
      alerta_disparada: iaResult.puntaje_urgencia >= 3,
      emoji_reaccion: iaResult.emoji_reaccion ?? null,
    });

    await this.messageRepo.save(mensajeUsuario);

    // 5. Crear mensaje del BOT con la respuesta generada
    const mensajeBot = this.messageRepo.create({
      content: iaResult.respuesta,
      status: EstadoMensaje.ENVIADO,
      wiseChat: chat,
      user: null,

      sentimiento: Sentimiento.NEUTRAL, // El sentimiento del bot es neutral
      nivel_urgencia: NivelUrgencia.BAJA,
      puntaje_urgencia: 0,

      isBot: true,
      alerta_disparada: false,
      emoji_reaccion: null,
    });

    await this.messageRepo.save(mensajeBot);

    // 6. Actualizar sentimiento global del chat
    chat.sentimiento_general = String(iaResult.sentimiento);
    chat.nivel_urgencia_general = String(iaResult.nivel_urgencia);
    await this.chatRepo.save(chat);

    return {
      ok: true,
      mensajeUsuario,
      mensajeBot,
      chatActualizado: chat,
    };
  }
}
