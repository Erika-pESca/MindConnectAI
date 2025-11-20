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

<<<<<<< HEAD
  @OneToMany(() => WiseChat, (wiseChat) => wiseChat.historial, { cascade: true })
=======
  @OneToMany(() => WiseChat, (wiseChat) => wiseChat.historial, {
    cascade: true,
  })
>>>>>>> 34cf1efa500f9f9c7cd6ced6cc8070bb18c865fe
  wiseChats: WiseChat[];
}
