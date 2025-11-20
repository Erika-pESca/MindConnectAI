import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';

import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async crearMensaje(@Body() dto: CreateMessageDto, @Req() req: Request) {
    const userId = (req as any).user.id; // viene del JWT

    return await this.messageService.crearMensaje(
      userId,
      Number(dto.chatId), // conversión segura
      dto.contenido,
    );
  }

  /**
   * Obtener todos los mensajes de un chat
   */
  @Get('chat/:chatId')
  async obtenerMensajesPorChat(@Param('chatId') chatId: string) {
    return await this.messageService.obtenerMensajesPorChat(Number(chatId));
  }

  /**
   * Verificar si hay respuestas del bot en un chat
   */
  @Get('chat/:chatId/bot-status')
  async verificarRespuestasBot(@Param('chatId') chatId: string) {
    return await this.messageService.verificarRespuestasBot(Number(chatId));
  }
}
