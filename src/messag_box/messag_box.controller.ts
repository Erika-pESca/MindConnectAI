import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessagBoxService } from './messag_box.service';
import { CreateMessagBoxDto } from './dto/create-messag_box.dto';
import { UpdateMessagBoxDto } from './dto/update-messag_box.dto';

@Controller('messag-box')
export class MessagBoxController {
  constructor(private readonly messagBoxService: MessagBoxService) {}

  @Post()
  create(@Body() createMessagBoxDto: CreateMessagBoxDto) {
    return this.messagBoxService.create(createMessagBoxDto);
  }

  @Get()
  findAll() {
    return this.messagBoxService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagBoxService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessagBoxDto: UpdateMessagBoxDto) {
    return this.messagBoxService.update(+id, updateMessagBoxDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagBoxService.remove(+id);
  }
}
