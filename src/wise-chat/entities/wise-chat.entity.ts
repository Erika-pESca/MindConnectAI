import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Message } from '../../message/entities/message.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Historial } from '../../historial/entities/historial.entity';

@Entity('wise_chats')
export class WiseChat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  nombre_chat: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

  /**
   * Resultado del análisis de sentimientos general del chat
   * Se actualiza automáticamente al crear mensajes nuevos.
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  sentimiento_general?: string; // 'positivo' | 'negativo' | 'neutro'

  /**
   * Urgencia acumulada en base al análisis NLP de mensajes
   * alto | medio | bajo
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  nivel_urgencia_general?: string;

  @CreateDateColumn()
  fecha_creacion: Date;

  // -----------------------------
  // RELACIONES
  // -----------------------------

  @OneToMany(() => Message, (message) => message.wiseChat, {
    cascade: true,
  })
  messages: Message[];

  @OneToMany(() => Notification, (notification) => notification.wiseChat)
  notifications: Notification[];

  @ManyToOne(() => Historial, (historial) => historial.wiseChats, {
    onDelete: 'CASCADE',
  })
  historial: Historial;
}
