import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { WiseChat } from '../wise-chat/entities/wise-chat.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, WiseChat])],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
