import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { WiseChatService } from './wise-chat.service';

@Controller('wisechat')
export class WiseChatController {
  constructor(private readonly wiseChatService: WiseChatService) {}

  @Post('create')
  create(@Body('name') name: string, @Body('description') description: string) {
    return this.wiseChatService.createChat(name, description);
  }

  @Post(':id/send')
  sendMessage(
    @Param('id') chatId: number,
    @Body('userId') userId: number,
    @Body('content') content: string,
  ) {
    return this.wiseChatService.sendMessage(userId, chatId, content);
  }

  @Get(':id/history')
  getHistory(@Param('id') chatId: number) {
    return this.wiseChatService.getChatHistory(chatId);
  }
}
