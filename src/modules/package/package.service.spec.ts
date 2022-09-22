import { Test, TestingModule } from '@nestjs/testing';
import { PackageService } from './package.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';

describe('PackageService', () => {
  let service: PackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PackageService,
        {
          provide: getRepositoryToken(Package),
          useFactory: jest.fn(() => ({})),
        },
      ],
    }).compile();

    service = module.get<PackageService>(PackageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
