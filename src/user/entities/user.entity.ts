import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Historial } from '../../historial/entities/historial.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Message } from '../../message/entities/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  profilePhoto?: string;

  @CreateDateColumn()
  createdAt: Date;

  // 1:1 con Historial (cada usuario tiene un historial)
  @OneToOne(() => Historial, (historial) => historial.user, { cascade: true })
  historial: Historial;

  // 1:N con Notification (usuario puede tener muchas notificaciones)
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // 1:N con Message (usuario puede enviar muchos mensajes)
  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}
