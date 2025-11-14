import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { HistorialModule } from './historial/historial.module';
import { WiseChatModule } from './wise-chat/wise-chat.module';
import { NotificationModule } from './notification/notification.module';
import { MessageModule } from './message/message.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, MessageModule, HistorialModule, WiseChatModule, NotificationModule, MessageModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
