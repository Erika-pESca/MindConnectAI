import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { WiseChat } from '../../wise-chat/entities/wise-chat.entity';

@Entity()
export class Historial {
  @PrimaryGeneratedColumn()
  id: number;

  // 1:1 inversa con User
  @OneToOne(() => User, (user) => user.historial)
  @JoinColumn() // la FK se almacena aquí o en User; con JoinColumn en esta o en User depende de donde quieras la FK
  user: User;

  // 1:N con WiseChat (cada historial contiene varios chats)
  @OneToMany(() => WiseChat, (wiseChat) => wiseChat.historial, { cascade: true })
  wiseChats: WiseChat[];
}
