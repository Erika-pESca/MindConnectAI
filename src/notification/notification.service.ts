import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../user/entities/user.entity';
import { WiseChat } from '../wise-chat/entities/wise-chat.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WiseChat)
    private readonly wiseChatRepository: Repository<WiseChat>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const { userId, wiseChatId, message } = createNotificationDto;

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const wiseChat = await this.wiseChatRepository.findOneBy({
      id: wiseChatId,
    });
    if (!wiseChat) {
      throw new NotFoundException(`WiseChat with ID ${wiseChatId} not found`);
    }

    const newNotification = this.notificationRepository.create({
      message,
      user,
      wiseChat,
    });

    return this.notificationRepository.save(newNotification);
  }

  findAll(): Promise<Notification[]> {
    return this.notificationRepository.find({
      relations: ['user', 'wiseChat'],
    });
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user', 'wiseChat'],
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.findOne(id);

    // Update status if provided
    if (updateNotificationDto.status) {
      notification.status = updateNotificationDto.status;
    }

    // Update message if provided
    if (updateNotificationDto.message) {
      notification.message = updateNotificationDto.message;
    }

    return this.notificationRepository.save(notification);
  }

  async remove(id: number): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
  }
}
