import { Test, TestingModule } from '@nestjs/testing';
import { UserPackageController } from './user_package.controller';
import { UserPackageService } from './user_package.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserPackage } from './entities/user_package.entity';

describe('UserPackageController', () => {
  let controller: UserPackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPackageController],
      providers: [
        UserPackageService,
        {
          provide: getRepositoryToken(UserPackage),
          useFactory: jest.fn(() => ({})),
        },
      ],
    }).compile();

    controller = module.get<UserPackageController>(UserPackageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
