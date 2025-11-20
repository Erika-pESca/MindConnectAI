import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { WiseChat } from '../../wise-chat/entities/wise-chat.entity';

@Entity()
export class Historial {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.historial, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => WiseChat, (wiseChat) => wiseChat.historial, {
    cascade: true,
  })
  wiseChats: WiseChat[];
}
