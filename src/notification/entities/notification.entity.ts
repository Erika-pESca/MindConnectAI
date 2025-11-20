import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { WiseChat } from '../../wise-chat/entities/wise-chat.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WiseChat, (wiseChat) => wiseChat.notifications, {
<<<<<<< HEAD
  onDelete: 'CASCADE',
})
wiseChat: WiseChat;

=======
    onDelete: 'CASCADE',
  })
  wiseChat: WiseChat;
>>>>>>> 34cf1efa500f9f9c7cd6ced6cc8070bb18c865fe

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'unread' })
  status: string;

  @CreateDateColumn()
  creation_date: Date;
}
