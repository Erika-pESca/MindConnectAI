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
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 'sent' }) // ej. 'sent', 'delivered', 'read'
  status: string;

  @CreateDateColumn()
  creation_date: Date;

  // Relación con el chat
  @ManyToOne(() => WiseChat, (wiseChat) => wiseChat.messages, { onDelete: 'CASCADE' })
  wiseChat: WiseChat;

  // Relación con el usuario que envió el mensaje
  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'SET NULL', nullable: true })
  user: User | null;
}
