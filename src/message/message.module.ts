import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message } from './entities/message.entity';
import { WiseChat } from '../wise-chat/entities/wise-chat.entity';
import { User } from '../user/entities/user.entity';

import { MessageService } from './message.service';
import { IaModule } from '../ia/ia.module';
import { MessageController } from './message.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, WiseChat, User]), IaModule],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
