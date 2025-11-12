import { Injectable } from '@nestjs/common';
import { CreateMessagBoxDto } from './dto/create-messag_box.dto';
import { UpdateMessagBoxDto } from './dto/update-messag_box.dto';

@Injectable()
export class MessagBoxService {
  create(createMessagBoxDto: CreateMessagBoxDto) {
    return 'This action adds a new messagBox';
  }

  findAll() {
    return `This action returns all messagBox`;
  }

  findOne(id: number) {
    return `This action returns a #${id} messagBox`;
  }

  update(id: number, updateMessagBoxDto: UpdateMessagBoxDto) {
    return `This action updates a #${id} messagBox`;
  }

  remove(id: number) {
    return `This action removes a #${id} messagBox`;
  }
}
