import { Test, TestingModule } from '@nestjs/testing';
import { WiseChatController } from './wise-chat.controller';
import { WiseChatService } from './wise-chat.service';

describe('WiseChatController', () => {
  let controller: WiseChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WiseChatController],
      providers: [WiseChatService],
    }).compile();

    controller = module.get<WiseChatController>(WiseChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
