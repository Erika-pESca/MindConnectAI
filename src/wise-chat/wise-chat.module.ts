import { Module } from '@nestjs/common';
import { WiseChatService } from './wise-chat.service';
import { WiseChatController } from './wise-chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WiseChat } from './entities/wise-chat.entity';
import { Message } from '../message/entities/message.entity';
import { Historial } from '../historial/entities/historial.entity';
import { IaModule } from '../ia/ia.module';
import { MessageModule } from '../message/message.module';
import { WiseChatGateway } from './wise-chat.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([WiseChat, Message, Historial]),
    IaModule,
    MessageModule,
  ],
  controllers: [WiseChatController],
  providers: [WiseChatService, WiseChatGateway],
  exports: [WiseChatService],
})
export class WiseChatModule {}
