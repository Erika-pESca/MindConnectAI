import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';

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
}
