import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entities/user.entity';
import { Message } from './message/entities/message.entity';
import { WiseChat } from './wise-chat/entities/wise-chat.entity';
import { Historial } from './historial/entities/historial.entity';
import { Notification } from './notification/entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', 
      password: '1234', 
      database: 'mind_connectIA',
      entities: [User, Message, WiseChat, Historial, Notification],
      synchronize: true, 
      logging: true,
    }),
    TypeOrmModule.forFeature([User, Message, WiseChat, Historial, Notification]),
  ],
})
export class AppModule {
   constructor() {
    console.log('➡️ Base de datos conectada correctamente ✔️');
   }
}