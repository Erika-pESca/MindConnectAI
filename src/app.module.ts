import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MessageModule } from './box/message/message.module';
import { MessagBoxModule } from './messag_box/messag_box.module';
import { WiseChatModule } from './wise-chat/wise-chat.module';
import { NotificationModule } from './notification/notification.module';
import { MenssageModule } from './menssage/menssage.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [UserModule, MessageModule, MessagBoxModule, WiseChatModule, NotificationModule, MenssageModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
