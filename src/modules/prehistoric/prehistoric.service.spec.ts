import { Test, TestingModule } from '@nestjs/testing';
import { PrehistoricService } from './prehistoric.service';

describe('PrehistoricService', () => {
  let service: PrehistoricService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrehistoricService],
    }).compile();

    service = module.get<PrehistoricService>(PrehistoricService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
