import { Test, TestingModule } from '@nestjs/testing';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';

describe('PackageController', () => {
  let controller: PackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PackageController],
      providers: [
        PackageService,

        {
          provide: getRepositoryToken(Package),
          useFactory: jest.fn(() => ({})),
        },
      ],
    }).compile();

    controller = module.get<PackageController>(PackageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
