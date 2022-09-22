import { Test, TestingModule } from '@nestjs/testing';
import { UserPackageService } from './user_package.service';

describe('UserPackageService', () => {
  let service: UserPackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserPackageService],
    }).compile();

    service = module.get<UserPackageService>(UserPackageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
