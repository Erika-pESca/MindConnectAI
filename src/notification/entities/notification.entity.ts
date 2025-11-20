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
    onDelete: 'CASCADE',
  })
  wiseChat: WiseChat;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'unread' })
  status: string;

  @CreateDateColumn()
  creation_date: Date;
}
