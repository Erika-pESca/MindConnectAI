import { Module } from '@nestjs/common';
import { WiseChatService } from './wise-chat.service';
import { WiseChatController } from './wise-chat.controller';

@Module({
  controllers: [WiseChatController],
  providers: [WiseChatService],
})
export class WiseChatModule {}
