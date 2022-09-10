import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { NotFoundException } from '@nestjs/common';
import { UserType } from '../users/users.constants';
import { User } from '../users/entities/user.entity';
import { LocationStatus } from './locations.contants';

describe('LocationsController', () => {
  it('user admin, allow blacklist, status <> approved', async () => {
    const model = new Location();
    model.is_blacklist = true;
    model.status = LocationStatus.PENDING;
    const repoMock: jest.Mock<{ findOneBy: jest.Mock<Location, []> }, []> =
      jest.fn(() => ({
        findOneBy: jest.fn(() => model),
      }));
    const controller = await getControllerWithMockUserBlacklist(repoMock);

    await expect(
      controller.findOne('1', { type: UserType.ADMIN } as User),
    ).resolves.toEqual(model);
  });

  it('not found, location is blacklist but user not admin', async () => {
    const model = new Location();
    model.is_blacklist = true;
    const repoMock: jest.Mock<{ findOneBy: jest.Mock<Location, []> }, []> =
      jest.fn(() => ({
        findOneBy: jest.fn(() => model),
      }));
    const controller = await getControllerWithMockUserBlacklist(repoMock);
    await expect(controller.findOne('1', undefined)).rejects.toEqual(
      new NotFoundException(),
    );
    await expect(
      controller.findOne('1', { type: UserType.CUSTOMER } as User),
    ).rejects.toEqual(new NotFoundException());
  });

  it('not found, location is pending and owner is not correct', async () => {
    const model = new Location();
    model.status = LocationStatus.PENDING;
    model.user_id = 2;
    const repoMock: jest.Mock<{ findOneBy: jest.Mock<Location, []> }, []> =
      jest.fn(() => ({
        findOneBy: jest.fn(() => model),
      }));
    const controller = await getControllerWithMockUserBlacklist(repoMock);

    //not valid
    await Promise.all([
      expect(controller.findOne('1', undefined)).rejects.toEqual(
        new NotFoundException(),
      ),
      expect(
        controller.findOne('1', { type: UserType.CUSTOMER } as User),
      ).rejects.toEqual(new NotFoundException()),
      expect(controller.findOne('1', { id: 2 } as User)).resolves.toEqual(
        model,
      ),
    ]);
  });
});

async function getControllerWithMockUserBlacklist(repoMock) {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [LocationsController],
    providers: [
      LocationsService,
      {
        provide: getRepositoryToken(Location),
        useFactory: repoMock,
      },
    ],
  }).compile();

  return module.get<LocationsController>(LocationsController);
}
