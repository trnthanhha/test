import { Test, TestingModule } from '@nestjs/testing';
import { ConsumersController } from './consumers.controller';
import { ConsumersService } from './consumers.service';

describe('ConsumersController', () => {
  let controller: ConsumersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsumersController],
      providers: [ConsumersService],
    }).compile();

    controller = module.get<ConsumersController>(ConsumersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
