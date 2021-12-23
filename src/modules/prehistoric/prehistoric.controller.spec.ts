import { Test, TestingModule } from '@nestjs/testing';
import { PrehistoricController } from './prehistoric.controller';
import { PrehistoricService } from './prehistoric.service';

describe('PrehistoricController', () => {
  let controller: PrehistoricController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrehistoricController],
      providers: [PrehistoricService],
    }).compile();

    controller = module.get<PrehistoricController>(PrehistoricController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
