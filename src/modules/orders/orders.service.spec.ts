import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { LocationsService } from '../locations/locations.service';
import { Location } from '../locations/entities/location.entity';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { StandardPrice } from '../standard-price/entities/standard-price.entity';
import { LocationHandleService } from '../location-handle/location-handle.service';
import { LocationHandle } from '../location-handle/entities/location-handle.entity';
import { StandardPriceHistory } from '../standard-price/entities/standard-price-history.entity';
import {
  REDIS_CLIENT_PROVIDER,
  REDIS_TOKEN_PROVIDER,
} from '../redis/redis.constants';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const mockRedis = jest.fn(() => ({
      incr: jest.fn(() => 1),
      expire: jest.fn(() => true),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        LocationsService,
        LocationHandleService,
        StandardPriceService,
        {
          provide: getRepositoryToken(Order),
          useFactory: jest.fn(() => ({})),
        },
        {
          provide: getRepositoryToken(Location),
          useFactory: jest.fn(() => ({})),
        },
        {
          provide: getRepositoryToken(LocationHandle),
          useFactory: jest.fn(() => ({})),
        },
        {
          provide: getRepositoryToken(StandardPrice),
          useFactory: jest.fn(() => ({})),
        },
        {
          provide: getRepositoryToken(StandardPriceHistory),
          useFactory: jest.fn(() => ({})),
        },
        {
          provide: REDIS_TOKEN_PROVIDER,
          useFactory: mockRedis,
        },
        {
          provide: REDIS_CLIENT_PROVIDER,
          useFactory: mockRedis,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
