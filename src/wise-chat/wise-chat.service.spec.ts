import { Test, TestingModule } from '@nestjs/testing';
import { WiseChatService } from './wise-chat.service';

describe('WiseChatService', () => {
  let service: WiseChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WiseChatService],
    }).compile();

    service = module.get<WiseChatService>(WiseChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
