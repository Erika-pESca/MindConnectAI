import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { Message } from '../../message/entities/message.entity';
<<<<<<< HEAD
import { Notification } from '../../notification/entities/notification.entity'; // <-- FALTA ESTA
=======
import { Notification } from '../../notification/entities/notification.entity';
import { Historial } from '../../historial/entities/historial.entity';
>>>>>>> 34cf1efa500f9f9c7cd6ced6cc8070bb18c865fe

@Entity('wise_chats')
export class WiseChat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
<<<<<<< HEAD
  name: string;
=======
  nombre_chat: string;
>>>>>>> 34cf1efa500f9f9c7cd6ced6cc8070bb18c865fe

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;

<<<<<<< HEAD
  @Column({ nullable: true })
  sentiment?: string;
=======
  /**
   * Resultado del análisis de sentimientos general del chat
   * Se actualiza automáticamente al crear mensajes nuevos.
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  sentimiento_general?: string; // 'positivo' | 'negativo' | 'neutro'
>>>>>>> 34cf1efa500f9f9c7cd6ced6cc8070bb18c865fe

  /**
   * Urgencia acumulada en base al análisis NLP de mensajes
   * alto | medio | bajo
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  nivel_urgencia_general?: string;

  @CreateDateColumn()
  fecha_creacion: Date;

<<<<<<< HEAD
  @ManyToOne(() => Historial, (historial) => historial.wiseChats, { onDelete: 'CASCADE' })
  historial: Historial;

  @OneToMany(() => Message, (message) => message.wiseChat, { cascade: true })
=======
  // -----------------------------
  // RELACIONES
  // -----------------------------

  @OneToMany(() => Message, (message) => message.wiseChat, {
    cascade: true,
  })
>>>>>>> 34cf1efa500f9f9c7cd6ced6cc8070bb18c865fe
  messages: Message[];

  @OneToMany(() => Notification, (notification) => notification.wiseChat, { cascade: true })
  notifications: Notification[];

  @ManyToOne(() => Historial, (historial) => historial.wiseChats, {
    onDelete: 'CASCADE',
  })
  historial: Historial;
}
