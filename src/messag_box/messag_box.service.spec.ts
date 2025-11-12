import { Test, TestingModule } from '@nestjs/testing';
import { MessagBoxService } from './messag_box.service';

describe('MessagBoxService', () => {
  let service: MessagBoxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagBoxService],
    }).compile();

    service = module.get<MessagBoxService>(MessagBoxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
