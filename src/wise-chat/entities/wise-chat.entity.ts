import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Historial } from '../../historial/entities/historial.entity';
import { Message } from '../../message/entities/message.entity';
import { Notification } from '../../notification/entities/notification.entity'; // <-- FALTA ESTA

@Entity()
export class WiseChat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  sentiment?: string;

  @Column({ nullable: true })
  urgency_level?: string;

  @CreateDateColumn()
  creation_date: Date;

  @ManyToOne(() => Historial, (historial) => historial.wiseChats, { onDelete: 'CASCADE' })
  historial: Historial;

  @OneToMany(() => Message, (message) => message.wiseChat, { cascade: true })
  messages: Message[];

  @OneToMany(() => Notification, (notification) => notification.wiseChat, { cascade: true })
  notifications: Notification[];
}
