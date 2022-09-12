import { Test, TestingModule } from '@nestjs/testing';
import { LocationsService } from './locations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { LocationStatus } from './locations.contants';
import { BadRequestException } from '@nestjs/common';

describe('LocationsService', () => {
  it('distance greater than 200m, Vincom Tran Duy Hung', async () => {
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
    }));
    const sv = await getService(mockRepo);
    const input = new Location();
    input.long = 105.79656486631434;
    input.lat = 21.007650506937715;
    input.block_radius = 50;
    await expect(sv.isValidDistance(input)).resolves.toEqual(true);
  });

  it('distance less than 300m, Vincom Tran Duy Hung', async () => {
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
        loc.block_radius = 150;

        return [loc];
      },
    }));
    const sv = await getService(mockRepo);
    const input = new Location();
    input.long = 105.79656486631434;
    input.lat = 21.007650506937715;
    input.block_radius = 50;
    await expect(sv.isValidDistance(input)).resolves.toEqual(false);
  });

  it('distance less than 200m, Vincom Tran Duy Hung', async () => {
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
    }));
    const sv = await getService(mockRepo);
    const input = new Location();
    input.long = 105.79609;
    input.lat = 21.007062;
    input.block_radius = 50;
    await expect(sv.isValidDistance(input)).resolves.toEqual(false);
  });
});

async function getService(mockRepo) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      LocationsService,
      {
        provide: getRepositoryToken(Location),
        useFactory: mockRepo,
      },
    ],
  }).compile();

  return module.get<LocationsService>(LocationsService);
}
