import { Module } from '@nestjs/common';
import { MessagBoxService } from './messag_box.service';
import { MessagBoxController } from './messag_box.controller';

@Module({
  controllers: [MessagBoxController],
  providers: [MessagBoxService],
})
export class MessagBoxModule {}
