 import { Module } from '@nestjs/common';
 import { TypeOrmModule } from '@nestjs/typeorm';
 import { HttpModule } from '@nestjs/axios';
 import { WiseChat } from '../wise-chat/entities/wise-chat.entity';
 import { Message } from '../message/entities/message.entity';
 import { Historial } from '../historial/entities/historial.entity';
 import { WiseChatService } from './wise-chat.service';
 import { WiseChatController } from './wise-chat.controller';

 import { ConfigModule } from '@nestjs/config';

 @Module({
   imports: [
     TypeOrmModule.forFeature([WiseChat, Message, Historial]),
     HttpModule,
     ConfigModule,
   ],
   providers: [WiseChatService],
   controllers: [WiseChatController],
 })
 export class WiseChatModule {}
