import { Test, TestingModule } from '@nestjs/testing';
import { UserPackageService } from './user_package.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Package } from '../package/entities/package.entity';
import { UserPackage } from './entities/user_package.entity';

describe('UserPackageService', () => {
  let service: UserPackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPackageService,
        {
          provide: getRepositoryToken(UserPackage),
          useFactory: jest.fn(() => ({})),
        },
      ],
    }).compile();

    service = module.get<UserPackageService>(UserPackageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
