import { Test, TestingModule } from '@nestjs/testing';
import { MessagBoxController } from './messag_box.controller';
import { MessagBoxService } from './messag_box.service';

describe('MessagBoxController', () => {
  let controller: MessagBoxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagBoxController],
      providers: [MessagBoxService],
    }).compile();

    controller = module.get<MessagBoxController>(MessagBoxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
