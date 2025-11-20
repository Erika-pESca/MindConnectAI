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
import { Notification } from '../../notification/entities/notification.entity';

@Entity()
export class WiseChat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string; // nombre o título del chat

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Campo donde guardas el resultado del análisis por chat
  @Column({ nullable: true })
  sentiment?: string;

  @Column({ nullable: true })
  urgency_level?: string;

  @CreateDateColumn()
  creation_date: Date;

  // Pertenece a un historial (Many WiseChat -> 1 Historial)
  @ManyToOne(() => Historial, (historial) => historial.wiseChats, { onDelete: 'CASCADE' })
  historial: Historial;

  @OneToMany(() => Message, (message) => message.wiseChat)
  messages: Message[];

  @OneToMany(() => Notification, (notification) => notification.wiseChat)
  notifications: Notification[];
}
