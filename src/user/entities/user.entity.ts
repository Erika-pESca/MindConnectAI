import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Message } from '../../message/entities/message.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Historial } from '../../historial/entities/historial.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'varchar',
    default: 'user',
  })
  role: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  last_login: Date | null;

  // 👇👇 RELACIONES QUE TE HACÍAN FALTA

  @OneToOne(() => Historial, (historial) => historial.user)
  historial: Historial;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
