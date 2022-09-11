import { Test, TestingModule } from '@nestjs/testing';
import { LocationHandleService } from './location-handle.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocationHandle } from './entities/location-handle.entity';
import { EntityManager } from 'typeorm';

describe('LocationHandleService', () => {
  let service: LocationHandleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationHandleService,
        {
          provide: getRepositoryToken(LocationHandle),
          useFactory: jest.fn(() => ({})),
        },
      ],
    }).compile();

    service = module.get<LocationHandleService>(LocationHandleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('convert name string to ascii', () => {
    expect(service.convertViToEn('Khu vực Vincom Trần Duy Hưng')).toEqual(
      'khu vuc vincom tran duy hung',
    );
  });

  it('create handle: convert to ascii, replace space to squash', async () => {
    const queryBuilder = function () {
      return this;
    };
    let item;
    const repoMock = jest.fn(() => ({
      manager: {
        createQueryBuilder: queryBuilder,
        insert: queryBuilder,
        into: queryBuilder,
        values: function (model) {
          item = model;
          return this;
        },
        orUpdate: queryBuilder,
        setParameter: queryBuilder,
        execute: async () => {
          return item;
        },
      } as unknown as EntityManager,
    }));

    const controller = await getController(repoMock);
    await expect(
      controller.createHandle(
        'Khu vực Vincom Trần Duy Hưng',
        repoMock().manager,
      ),
    ).resolves.toEqual({
      name: 'khu-vuc-vincom-tran-duy-hung',
    });
  });
});

async function getController(repoMock) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      LocationHandleService,
      {
        provide: getRepositoryToken(LocationHandle),
        useFactory: repoMock,
      },
    ],
  }).compile();

  return module.get<LocationHandleService>(LocationHandleService);
}
