import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { LocationsService } from '../locations/locations.service';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { Location } from '../locations/entities/location.entity';
import {
  REDIS_CLIENT_PROVIDER,
  REDIS_TOKEN_PROVIDER,
} from '../redis/redis.constants';
import { StandardPrice } from '../standard-price/entities/standard-price.entity';
import { StandardPriceHistory } from '../standard-price/entities/standard-price-history.entity';
import { LocationHandleService } from '../location-handle/location-handle.service';
import { LocationHandle } from '../location-handle/entities/location-handle.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        I18nModule.forRoot({
          fallbackLanguage: 'en',
          loaderOptions: {
            path: 'src/i18n',
            watch: true,
          },
          resolvers: [
            { use: QueryResolver, options: ['lang'] },
            AcceptLanguageResolver,
          ],
        }),
      ],
      controllers: [OrdersController],
      providers: [
        OrdersService,
        UsersService,
        LocationsService,
        LocationHandleService,
        StandardPriceService,
        {
          provide: getRepositoryToken(User),
          useFactory: jest.fn(() => ({})),
        },
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
          useFactory: jest.fn(() => ({})),
        },
        {
          provide: REDIS_CLIENT_PROVIDER,
          useFactory: jest.fn(() => ({})),
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
