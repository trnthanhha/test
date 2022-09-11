import { Test, TestingModule } from '@nestjs/testing';
import { LocationHandleService } from './location-handle.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocationHandle } from './entities/location-handle.entity';
import { EntityManager, UpdateResult } from 'typeorm';

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
    const repoMock = jest.fn(() => ({
      manager: {
        findOneBy: () => undefined,
        insert: () => {},
      } as unknown as EntityManager,
    }));

    const controller = await getController(repoMock);
    await expect(
      controller.createHandle(
        'Công ty cổ phần Agiletech Việt Nam - Số 82 ngõ 116 Nhân Hòa, q.Thanh Xuân, Hà Nội',
        repoMock().manager,
      ),
    ).resolves.toEqual(
      'cong-ty-co-phan-agiletech-viet-nam---so-82-ngo-116-nhan-hoa,-q.thanh-xuan,-ha-noi',
    );
  });

  it('update handle: convert to ascii, replace space to squash', async () => {
    const repoMock = jest.fn(() => ({
      manager: {
        findOneBy: () => {
          return {
            total: 2,
          };
        },
        update: () => {
          const rs = new UpdateResult();
          rs.affected = 1;
          return rs;
        },
      } as unknown as EntityManager,
    }));

    const controller = await getController(repoMock);
    await expect(
      controller.createHandle(
        'Công ty cổ phần Agiletech Việt Nam - Số 82 ngõ 116 Nhân Hòa, q.Thanh Xuân, Hà Nội',
        repoMock().manager,
      ),
    ).resolves.toEqual(
      'cong-ty-co-phan-agiletech-viet-nam---so-82-ngo-116-nhan-hoa,-q.thanh-xuan,-ha-noi-3',
    );
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
