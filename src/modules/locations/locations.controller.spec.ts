import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserType } from '../users/users.constants';
import { User } from '../users/entities/user.entity';
import {
  DefaultSafeZoneRadius,
  LocationNFTStatus,
  LocationStatus,
  LocationType,
} from './locations.contants';
import { LocationHandleService } from '../location-handle/location-handle.service';
import { LocationHandle } from '../location-handle/entities/location-handle.entity';
import {
  EntityManager,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';

describe('LocationsController', () => {
  it('FindOneLocation: user admin, allow blacklist, status <> approved', async () => {
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

  it('FindOneLocation: not found, location is blacklist but user not admin', async () => {
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

  it('FindOneLocation: not found, location is pending and owner is not correct', async () => {
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

  it('CreateLocation: distance is less than 200m, status init with PENDING', async () => {
    const model = new CreateLocationDto();
    model.name = 'Near vincom Tran Duy Hung';
    model.lat = 21.007062;
    model.long = 105.79609;
    model.map_captured = 'https://nftdiadiem.com/vincom-tran-duy-hung';

    const mockManager = {
      transaction: async function (
        runInTx: (entityManager: EntityManager) => Promise<Location>,
      ): Promise<Location> {
        return runInTx(mockManager);
      },
      findOneBy: () => undefined,
      insert: () => undefined,
      save: (item) => item,
    } as unknown as EntityManager;

    const mockRepo = jest.fn(() => ({
      findBy: (option: FindOptionsWhere<Location>) => {
        if (option.status !== LocationStatus.APPROVED) {
          throw new BadRequestException();
        }

        const isObjDiff = (obj1, obj2) => {
          return JSON.stringify(obj1) !== JSON.stringify(obj2);
        };
        switch (true) {
          case isObjDiff(
            option.safe_zone_bot,
            LessThanOrEqual(21.00841280372822),
          ):
          case isObjDiff(
            option.safe_zone_top,
            MoreThanOrEqual(21.005711196271783),
          ):
          case isObjDiff(
            option.safe_zone_left,
            LessThanOrEqual(105.79744080372822),
          ):
          case isObjDiff(
            option.safe_zone_right,
            MoreThanOrEqual(105.79473919627179),
          ):
            throw new BadRequestException();
        }
        const loc = new Location();
        loc.long = 105.79521595313413;
        loc.lat = 21.00630297282199;
        loc.block_radius = 50;

        return [loc];
      },
      manager: mockManager,
    }));
    const controller = await getControllerWithMockUserBlacklist(mockRepo);
    const response = new Location();
    Object.assign(response, model);
    response.name = model.name;
    response.handle = 'near-vincom-tran-duy-hung';
    response.lat = model.lat;
    response.long = model.long;
    response.map_captured = model.map_captured;
    response.nft_status = LocationNFTStatus.PENDING;
    response.type = LocationType.CUSTOMER;
    response.block_radius = DefaultSafeZoneRadius;
    response.country = 'VN';
    response.status = LocationStatus.PENDING;

    response.safe_zone_bot = 21.006611732090594;
    response.safe_zone_left = 105.7956397320906;
    response.safe_zone_right = 105.7965402679094;
    response.safe_zone_top = 21.00751226790941;
    //sys
    response.user_id = 1;
    response.created_by_id = 1;

    const created = await controller.create(model, { id: 1 } as User);
    expect(created).toEqual(response);
  });

  it('CreateLocation: distance is greater than 200m, status init with APPROVED', async () => {
    const approvedAt = new Date();

    const model = new CreateLocationDto();
    model.requestedAt = approvedAt;
    model.name = 'Far from vincom Tran Duy Hung';
    model.lat = 21.007650506937715;
    model.long = 105.79656486631434;
    model.map_captured = 'https://nftdiadiem.com/vincom-tran-duy-hung';

    const mockManager = {
      transaction: async function (
        runInTx: (entityManager: EntityManager) => Promise<Location>,
      ): Promise<Location> {
        return runInTx(mockManager);
      },
      findOneBy: () => undefined,
      insert: () => undefined,
      save: (item) => item,
    } as unknown as EntityManager;

    const mockRepo = jest.fn(() => ({
      findBy: (option: FindOptionsWhere<Location>) => {
        if (option.status !== LocationStatus.APPROVED) {
          throw new BadRequestException();
        }

        const isObjDiff = (obj1, obj2) => {
          return JSON.stringify(obj1) !== JSON.stringify(obj2);
        };
        switch (true) {
          case isObjDiff(
            option.safe_zone_bot,
            LessThanOrEqual(21.009001310665933),
          ):
          case isObjDiff(
            option.safe_zone_top,
            MoreThanOrEqual(21.006299703209496),
          ):
          case isObjDiff(
            option.safe_zone_left,
            LessThanOrEqual(105.79791567004256),
          ):
          case isObjDiff(
            option.safe_zone_right,
            MoreThanOrEqual(105.79521406258613),
          ):
            throw new BadRequestException();
        }
        const loc = new Location();
        loc.long = 105.79521595313413;
        loc.lat = 21.00630297282199;
        loc.block_radius = 50;

        return [loc];
      },
      manager: mockManager,
    }));

    const controller = await getControllerWithMockUserBlacklist(mockRepo);
    const response = new Location();
    Object.assign(response, model);
    response.name = model.name;
    response.handle = 'far-from-vincom-tran-duy-hung';
    response.lat = model.lat;
    response.long = model.long;
    response.map_captured = model.map_captured;
    response.nft_status = LocationNFTStatus.PENDING;
    response.type = LocationType.CUSTOMER;
    response.block_radius = DefaultSafeZoneRadius;
    response.country = 'VN';
    response.status = LocationStatus.APPROVED;
    response.approved_by_id = -1;
    response.approved_at = approvedAt;

    response.safe_zone_bot = 21.007200239028307;
    response.safe_zone_left = 105.79611459840494;
    response.safe_zone_right = 105.79701513422374;
    response.safe_zone_top = 21.008100774847122;
    //sys
    response.user_id = 1;
    response.created_by_id = 1;

    const created = await controller.create(model, { id: 1 } as User);
    expect(created).toEqual(response);
  });
});

async function getControllerWithMockUserBlacklist(
  repoMock,
  locationHandleMockService?,
) {
  if (!locationHandleMockService) {
    locationHandleMockService = await getTestingService();
  }
  const module: TestingModule = await Test.createTestingModule({
    controllers: [LocationsController],
    providers: [
      LocationsService,
      LocationHandleService,
      {
        provide: getRepositoryToken(Location),
        useFactory: repoMock,
      },
    ],
  })
    .overrideProvider(LocationHandleService)
    .useValue(locationHandleMockService)
    .compile();

  return module.get<LocationsController>(LocationsController);
}

async function getTestingService() {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      LocationHandleService,
      {
        provide: getRepositoryToken(LocationHandle),
        useFactory: jest.fn(() => ({})),
      },
    ],
  }).compile();

  return module.get<LocationHandleService>(LocationHandleService);
}
