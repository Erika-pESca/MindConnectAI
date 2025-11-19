import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { Notification } from '../notification/entities/notification.entity';

@Injectable()
export class UserCronService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async checkInactiveUsers() {
    const users = await this.userRepo.find();
    const now = new Date();

    for (const user of users) {
      if (!user.last_login) continue;

      const diffMonths =
        (now.getFullYear() - user.last_login.getFullYear()) * 12 +
        (now.getMonth() - user.last_login.getMonth());

      // --- 11 MESES: advertencia ---
      if (diffMonths >= 11 && diffMonths < 12) {
        await this.notificationRepo.save({
          user,
          message:
            'Tu cuenta será inactivada si no ingresas durante el próximo mes.',
        });
      }

      // --- 12 MESES: solo notificación (sin status porque NO existe en User) ---
      if (diffMonths >= 12) {
        await this.notificationRepo.save({
          user,
          message: 'Tu cuenta ha cumplido un año sin actividad.',
        });
      }
    }
  }
}
