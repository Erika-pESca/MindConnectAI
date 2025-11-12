import { Injectable } from '@nestjs/common';
import { CreateWiseChatDto } from './dto/create-wise-chat.dto';
import { UpdateWiseChatDto } from './dto/update-wise-chat.dto';

@Injectable()
export class WiseChatService {
  create(createWiseChatDto: CreateWiseChatDto) {
    return 'This action adds a new wiseChat';
  }

  findAll() {
    return `This action returns all wiseChat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wiseChat`;
  }

  update(id: number, updateWiseChatDto: UpdateWiseChatDto) {
    return `This action updates a #${id} wiseChat`;
  }

  remove(id: number) {
    return `This action removes a #${id} wiseChat`;
  }
}
