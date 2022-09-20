import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location } from '../locations/entities/location.entity';
import { User } from '../users/entities/user.entity';
import { ContractService } from './contract.service';
import { Contract } from './entities/contract.entity';

describe('ContracService', () => {
  let service: ContractService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      //   imports: [TypeOrmModule.forFeature([User, Location])],
      providers: [
        ContractService,
        {
          provide: getRepositoryToken(Contract),
          useFactory: jest.fn(() => ({})),
        },
        {
          provide: getRepositoryToken(User),
          useFactory: jest.fn(() => ({})),
        },
        {
          provide: getRepositoryToken(Location),
          useFactory: jest.fn(() => ({})),
        },
      ],
    }).compile();

    service = module.get<ContractService>(ContractService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
