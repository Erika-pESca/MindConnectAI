import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WiseChatService } from './wise-chat.service';
import { CreateWiseChatDto } from './dto/create-wise-chat.dto';
import { UpdateWiseChatDto } from './dto/update-wise-chat.dto';

@Controller('wise-chat')
export class WiseChatController {
  constructor(private readonly wiseChatService: WiseChatService) {}

  @Post()
  create(@Body() createWiseChatDto: CreateWiseChatDto) {
    return this.wiseChatService.create(createWiseChatDto);
  }

  @Get()
  findAll() {
    return this.wiseChatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wiseChatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWiseChatDto: UpdateWiseChatDto) {
    return this.wiseChatService.update(+id, updateWiseChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wiseChatService.remove(+id);
  }
}
