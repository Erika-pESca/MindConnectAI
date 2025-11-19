import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';

import { WiseChat } from '../../wise-chat/entities/wise-chat.entity';
import { User } from '../../user/entities/user.entity';
import { Sentimiento } from '../enums/sentimiento.enum';
import { NivelUrgencia } from '../enums/nivel-urgencia.enum';
import { EstadoMensaje } from '../enums/estado-mensaje.enum';

@Entity({ name: 'messages' })
@Index(['wiseChat'])
@Index(['user'])
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: EstadoMensaje,
    default: EstadoMensaje.ENVIADO,
  })
  status: EstadoMensaje;

  @CreateDateColumn({ name: 'creation_date' })
  creation_date: Date;

  // ----------------------------
  // 📌 Análisis IA por mensaje
  // ----------------------------

  @Column({
    type: 'enum',
    enum: Sentimiento,
    default: Sentimiento.DESCONOCIDO,
  })
  sentimiento: Sentimiento;

  @Column({
    type: 'enum',
    enum: NivelUrgencia,
    nullable: true,
  })
  nivel_urgencia: NivelUrgencia | null;

  @Column({ type: 'int', default: 0 })
  puntaje_urgencia: number; // 0-3

  // ----------------------------
  // 📌 BOT / IA
  // ----------------------------

  @Column({ type: 'boolean', default: false })
  isBot: boolean;

  // ----------------------------
  // 📌 Alertas y Sockets
  // ----------------------------

  @Column({ type: 'boolean', default: false })
  alerta_disparada: boolean;

  @Column({ type: 'varchar', length: 10, nullable: true })
  emoji_reaccion: string | null;

  // ----------------------------
  // 📌 Relaciones
  // ----------------------------

  @ManyToOne(() => WiseChat, (wiseChat) => wiseChat.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wiseChat_id' })
  wiseChat: WiseChat;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
