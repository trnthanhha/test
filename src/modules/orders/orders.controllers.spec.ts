import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { User } from '../users/entities/user.entity';
import { OrdersService } from './orders.service';
import { PackageService } from '../package/package.service';
import { Package } from '../package/entities/package.entity';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { StandardPrice } from '../standard-price/entities/standard-price.entity';
import { BillsService } from '../bills/bills.service';
import { Bill } from '../bills/entities/bill.entity';
import { Location } from '../locations/entities/location.entity';
import { LocationsService } from '../locations/locations.service';
import { LocationHandleService } from '../location-handle/location-handle.service';
import { LocationHandle } from '../location-handle/entities/location-handle.entity';
import { StandardPriceHistory } from '../standard-price/entities/standard-price-history.entity';
import {
  REDIS_CLIENT_PROVIDER,
  REDIS_TOKEN_PROVIDER,
} from '../redis/redis.constants';
import { UsersService } from '../users/users.service';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { PaymentStatus, PaymentType } from './orders.constants';
import {
  LocationNFTStatus,
  LocationPurchaseStatus,
  LocationStatus,
  LocationType,
} from '../locations/locations.contants';
import {
  EntityManager,
  LessThanOrEqual,
  MoreThanOrEqual,
  UpdateResult,
} from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { UserPackage } from '../user_package/entities/user_package.entity';
import { Repository } from 'typeorm/repository/Repository';
import { UPackagePurchaseStatus } from '../user_package/user_package.constants';
import { BadRequestException } from '@nestjs/common';

describe('Order controller', () => {
  beforeEach(() => {
    process.env.APP_DOMAIN = 'https://localhost:3002/';
    process.env.VNP_TmnCode = 'TEST';
    process.env.VNP_HashSecret = 'TEST_SECRET';
    process.env.VNP_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    process.env.VNP_ReturnRoute = 'orders/status';
  });

  it('Checkout: buy existed location by cash', async () => {
    // ---- Custom mock repository
    mockManager.update = (
      entity,
      criteria,
      updateValue,
    ): Promise<UpdateResult> => {
      switch (entity) {
        case Location:
          expect(criteria).toEqual({ id: 1, version: 3 });
          expect(updateValue).toEqual({
            purchase_status: LocationPurchaseStatus.UNAUTHORIZED,
            version: 4,
          });

          const updated = new UpdateResult();
          updated.affected = 1;
          return Promise.resolve(updated);
      }
    };

    mockManager.getRepository = (e): Repository<any> => {
      switch (e) {
        case Order:
          return {
            save: (o: Order) => {
              expect(o.price).toEqual(100);
              expect(o.payment_status).toEqual(PaymentStatus.UNAUTHORIZED);
              expect(o.note).toEqual('Thanh toan mua LocaMos dia diem');
              // create order
              o.id = 1;
              return o;
            },
          } as unknown as Repository<any>;
        case Bill:
          return {
            save: (b: Bill) => {
              b.id = 1;
              return b;
            },
          } as unknown as Repository<any>;
      }
    };

    // --- Process
    const controller = await getOrderController();
    const dto = new CreateOrderDto();
    dto.location_id = 1;
    dto.type = PaymentType.CASH;
    const rs = await controller.create(
      dto,
      { headers: {}, socket: {}, connection: { remoteAddress: 'localhost' } },
      new User(),
    );
    expect(rs.success).toEqual(true);
    expect(rs.location_name).toEqual('my bought location name');
  });

  it('Checkout: buy custom location by cash', async () => {
    const updated = new UpdateResult();
    updated.affected = 1;
    // -- Custom mock repository
    mockManager.update = (
      entity,
      criteria,
      updateValue,
    ): Promise<UpdateResult> => {
      switch (entity) {
        case Location:
          expect(criteria).toEqual({ id: 2, version: 1 });
          expect(updateValue).toEqual({
            purchase_status: LocationPurchaseStatus.UNAUTHORIZED,
            version: 2,
          });

          return Promise.resolve(updated);
        case LocationHandle:
          expect(criteria).toEqual({
            name: 'my-new-custom-location',
            total: 2,
          });
          expect(updateValue).toEqual({ total: 3 });

          return Promise.resolve(updated);
      }
    };
    mockManager.getRepository = (e): Repository<any> => {
      switch (e) {
        case Order:
          return {
            save: (o: Order) => {
              expect(o.price).toEqual(100);
              expect(o.payment_status).toEqual(PaymentStatus.UNAUTHORIZED);
              expect(o.note).toEqual('Thanh toan mua LocaMos dia diem');
              // create order
              o.id = 1;
              return o;
            },
          } as unknown as Repository<any>;
        case Bill:
          return {
            save: (b: Bill) => {
              b.id = 1;
              return b;
            },
          } as unknown as Repository<any>;
      }
    };

    // --- Processing
    const controller = await getOrderController();
    const dto = new CreateOrderDto();
    dto.lat = 20;
    dto.long = 100;
    dto.map_captured = 'https//maps.google.com';
    dto.name = 'my new custom location';
    dto.type = PaymentType.CASH;
    const rs = await controller.create(
      dto,
      { headers: {}, socket: {}, connection: { remoteAddress: 'localhost' } },
      new User(),
    );
    expect(rs.success).toEqual(true);
    expect(rs.location_name).toEqual('my new custom location');
  });

  it('Checkout: buy package by cash', async () => {
    const updated = new UpdateResult();
    updated.affected = 1;

    // --- Custom mock repository
    mockManager.update = (
      entity,
      criteria,
      updateValue,
    ): Promise<UpdateResult> => {
      switch (entity) {
        case Location:
          expect(criteria).toEqual({ id: 2, version: 99 });
          expect(updateValue).toEqual({
            purchase_status: LocationPurchaseStatus.UNAUTHORIZED,
            version: 99,
          });

          return Promise.resolve(updated);
      }
    };
    mockManager.getRepository = (e) => {
      switch (e) {
        case UserPackage:
          return {
            save: (item: UserPackage) => {
              expect(item).toEqual(
                Object.assign(new UserPackage(), {
                  package_id: 2,
                  user_id: -1,
                  package_name: 'Premium combo x5',
                  quantity: 5,
                  remaining_quantity: 5,
                  price: 500,
                  purchase_status: UPackagePurchaseStatus.UNAUTHORIZED,
                } as UserPackage),
              );

              item.id = 7;
              item.version = 1;

              return item;
            },
          } as unknown as Repository<any>;
        case Order:
          return {
            save: (o: Order) => {
              expect(o.price).toEqual(500);
              expect(o.payment_status).toEqual(PaymentStatus.UNAUTHORIZED);
              expect(o.note).toEqual('Thanh toan mua LocaMos package/combo');
              // create order
              o.id = 1;
              return o;
            },
          } as unknown as Repository<any>;
        case Bill:
          return {
            save: (b: Bill) => {
              b.id = 1;
              return b;
            },
          } as unknown as Repository<any>;
      }
    };

    // --- Processing
    const controller = await getOrderController();
    const dto = new CreateOrderDto();
    dto.type = PaymentType.CASH;
    dto.package_id = 2;
    const rs = await controller.create(
      dto,
      { headers: {}, socket: {}, connection: { remoteAddress: 'localhost' } },
      new User(),
    );
    expect(rs.success).toEqual(true);
    expect(rs.package_name).toEqual('Premium combo x5');
  });

  it('Checkout: buy location by package -- failed by no remaining quantity', async () => {
    // ---- Custom mock repository
    mockManager.getRepository = (e): Repository<any> => {
      switch (e) {
        case Location:
          return {
            findOneBy: ({ id }) => {
              expect(id).toEqual(1);
              const loc = new Location();
              loc.id = 1;
              loc.name = 'my bought location name';
              loc.status = LocationStatus.APPROVED;
              loc.version = 3;

              return loc;
            },
          } as unknown as Repository<any>;
        case UserPackage:
          return {
            findOneBy: ({ id }) => {
              expect(id).toEqual(4);
              return Object.assign(new UserPackage(), {
                id: 4,
                remaining_quantity: 0,
              } as UserPackage);
            },
          } as unknown as Repository<any>;
      }
    };

    // --- Process
    const { controller, dto } = await initParamTestBuyByPackage();
    await expect(
      controller.create(
        dto,
        { headers: {}, socket: {}, connection: { remoteAddress: 'localhost' } },
        new User(),
      ),
    ).rejects.toEqual(
      new BadRequestException(
        'User not exist package || zero quantity || package unpaid',
      ),
    );
  });

  it('Checkout: buy location by package -- failed by user package unpaid - failed purchase', async () => {
    // ---- Custom mock repository
    mockManager.getRepository = (e): Repository<any> => {
      switch (e) {
        case Location:
          return {
            findOneBy: ({ id }) => {
              expect(id).toEqual(1);
              const loc = new Location();
              loc.id = 1;
              loc.name = 'my bought location name';
              loc.status = LocationStatus.APPROVED;
              loc.version = 3;

              return loc;
            },
          } as unknown as Repository<any>;
        case UserPackage:
          return {
            findOneBy: ({ id }) => {
              expect(id).toEqual(4);
              return Object.assign(new UserPackage(), {
                id: 4,
                remaining_quantity: 4,
                purchase_status: UPackagePurchaseStatus.FAILED,
              } as UserPackage);
            },
          } as unknown as Repository<any>;
      }
    };

    // --- Process
    const { controller, dto } = await initParamTestBuyByPackage();
    await expect(
      controller.create(
        dto,
        { headers: {}, socket: {}, connection: { remoteAddress: 'localhost' } },
        new User(),
      ),
    ).rejects.toEqual(
      new BadRequestException(
        'User not exist package || zero quantity || package unpaid',
      ),
    );
  });

  it('Checkout: buy location by package -- failed by user package unpaid - unauthorized purchase', async () => {
    // ---- Custom mock repository
    mockManager.getRepository = (e): Repository<any> => {
      switch (e) {
        case Location:
          return {
            findOneBy: ({ id }) => {
              expect(id).toEqual(1);
              const loc = new Location();
              loc.id = 1;
              loc.name = 'my bought location name';
              loc.status = LocationStatus.APPROVED;
              loc.version = 3;

              return loc;
            },
          } as unknown as Repository<any>;
        case UserPackage:
          return {
            findOneBy: ({ id }) => {
              expect(id).toEqual(4);
              return Object.assign(new UserPackage(), {
                id: 4,
                remaining_quantity: 4,
                purchase_status: UPackagePurchaseStatus.UNAUTHORIZED,
              } as UserPackage);
            },
          } as unknown as Repository<any>;
      }
    };

    // --- Process
    const { controller, dto } = await initParamTestBuyByPackage();
    await expect(
      controller.create(
        dto,
        { headers: {}, socket: {}, connection: { remoteAddress: 'localhost' } },
        new User(),
      ),
    ).rejects.toThrowError(
      new BadRequestException(
        'User not exist package || zero quantity || package unpaid',
      ),
    );
  });

  it('Checkout: buy existed location by package -- failed by location cant purchase', async () => {
    const updated = new UpdateResult();
    updated.affected = 1;
    // -- Custom mock repository
    mockManager.getRepository = (e): Repository<any> => {
      switch (e) {
        case Location:
          return {
            findOneBy: ({ id }) => {
              expect(id).toEqual(1);
              const loc = new Location();
              loc.id = 1;
              loc.name = 'my bought location name';
              loc.purchase_status = LocationPurchaseStatus.UNAUTHORIZED;
              loc.version = 3;

              return loc;
            },
          } as unknown as Repository<any>;
        case UserPackage:
          return {
            findOneBy: ({ id }) => {
              expect(id).toEqual(4);
              return Object.assign(new UserPackage(), {
                id: 4,
                package_name: 'Premium combo x5',
                version: 2,
                package_id: 2,
                quantity: 5,
                remaining_quantity: 4,
                purchase_status: UPackagePurchaseStatus.PAID,
              } as UserPackage);
            },
          } as unknown as Repository<any>;
      }
    };

    // --- Processing
    const { controller, dto } = await initParamTestBuyByPackage();
    await expect(
      controller.create(
        dto,
        { headers: {}, socket: {}, connection: { remoteAddress: 'localhost' } },
        new User(),
      ),
    ).rejects.toThrowError(
      new BadRequestException('Location is unable to purchase'),
    );
  });

  it('Checkout: buy existed location by package succeeded', async () => {
    const updated = new UpdateResult();
    updated.affected = 1;
    // -- Custom mock repository
    mockManager.update = (
      entity,
      criteria,
      updateValue,
    ): Promise<UpdateResult> => {
      switch (entity) {
        case Location:
          expect(criteria).toEqual({ id: 2, version: 1 });
          expect(updateValue).toEqual({
            purchase_status: null,
            version: 2,
          });

          return Promise.resolve(updated);
        case LocationHandle:
          expect(criteria).toEqual({
            name: 'my-new-custom-location',
            total: 2,
          });
          expect(updateValue).toEqual({ total: 3 });

          return Promise.resolve(updated);
      }
    };
    mockManager.getRepository = (e): Repository<any> => {
      switch (e) {
        case Location:
          return {
            findOneBy: ({ id }) => {
              expect(id).toEqual(1);
              const loc = new Location();
              loc.id = 2;
              loc.name = 'my bought location name';
              loc.status = LocationStatus.APPROVED;
              loc.version = 1;

              return loc;
            },
          } as unknown as Repository<any>;
        case UserPackage:
          return {
            findOneBy: ({ id }) => {
              expect(id).toEqual(4);
              return Object.assign(new UserPackage(), validUserPackage());
            },
          } as unknown as Repository<any>;
        case Order:
          return {
            save: (o: Order) => {
              expect(o.price).toEqual(100);
              expect(o.payment_status).toEqual(PaymentStatus.PAID);
              expect(o.note).toEqual('Thanh toan mua LocaMos dia diem su dung package');
              // create order
              o.id = 1;
              return o;
            },
          } as unknown as Repository<any>;
        case Bill:
          return {
            save: (b: Bill) => {
              b.id = 1;
              return b;
            },
          } as unknown as Repository<any>;
      }
    };

    // --- Processing
    const { controller, dto } = await initParamTestBuyByPackage();
    const rs = await controller.create(
      dto,
      { headers: {}, socket: {}, connection: { remoteAddress: 'localhost' } },
      new User(),
    );
    expect(rs.success).toEqual(true);
    expect(rs.location_name).toEqual('my bought location name');
  });
});

const mockManager = {
  transaction: async function (
    runInTx: (entityManager: EntityManager) => Promise<Location>,
  ): Promise<Location> {
    return runInTx(mockManager);
  },
  findOneBy: (entity, { name }) => {
    switch (entity) {
      case LocationHandle:
        return Object.assign(new LocationHandle(), {
          name,
          total: 2,
        } as LocationHandle);
    }
  },
  save: (item) => {
    if (item instanceof Location) {
      delete item['approved_at'];
      expect(item).toEqual(
        Object.assign(new Location(), {
          lat: 20,
          long: 100,
          map_captured: 'https//maps.google.com',
          name: 'my new custom location',
          type: LocationType.CUSTOMER,
          block_radius: 50,
          safe_zone_top: 20.000450267909407,
          safe_zone_bot: 19.999549732090593,
          safe_zone_left: 99.9995497320906,
          safe_zone_right: 100.0004502679094,
          nft_status: LocationNFTStatus.PENDING,
          country: 'VN',
          status: LocationStatus.APPROVED,
          approved_by_id: -1,
          user_id: -1,
          created_by_id: -1,
          user_full_name: 'undefined undefined',
          handle: 'my-new-custom-location-2',
        } as Location),
      );

      item.id = 2;
      item.version = 1;
      return item;
    }
  },
} as unknown as EntityManager;

async function getOrderController() {
  const orderService = await getTestingOrderService();
  const billsService = await getTestingBillsService();
  const usersService = await getTestingUsersService();
  const module: TestingModule = await Test.createTestingModule({
    controllers: [OrdersController],
    providers: [
      OrdersService,
      BillsService,
      UsersService,
      {
        provide: getRepositoryToken(Order),
        useFactory: jest.fn(() => ({})),
      },
    ],
  })
    .overrideProvider(OrdersService)
    .useValue(orderService)
    .overrideProvider(BillsService)
    .useValue(billsService)
    .overrideProvider(UsersService)
    .useValue(usersService)
    .compile();

  return module.get<OrdersController>(OrdersController);
}

async function getTestingOrderService() {
  const pkgService = await getTestingPackageService();
  const billService = await getTestingBillsService();
  const locService = await getTestingLocationService();
  const stdPriceService = await getTestingStandardPriceService();
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      OrdersService,
      BillsService,
      PackageService,
      LocationsService,
      StandardPriceService,
      {
        provide: getRepositoryToken(Order),
        useFactory: jest.fn(() => ({
          manager: mockManager,
        })),
      },
    ],
  })
    .overrideProvider(PackageService)
    .useValue(pkgService)
    .overrideProvider(BillsService)
    .useValue(billService)
    .overrideProvider(LocationsService)
    .useValue(locService)
    .overrideProvider(StandardPriceService)
    .useValue(stdPriceService)
    .compile();

  return module.get<OrdersService>(OrdersService);
}

async function getTestingPackageService() {
  const stdPriceSv = await getTestingStandardPriceService();

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      PackageService,
      StandardPriceService,
      {
        provide: getRepositoryToken(Package),
        useFactory: jest.fn(() => ({
          findOneBy: ({ id }) => {
            expect(id).toEqual(2);
            return Object.assign(new Package(), {
              id: 2,
              version: 1,
              name: 'Premium combo x5',
              price: 500,
            } as Package);
          },
        })),
      },
    ],
  })
    .overrideProvider(StandardPriceService)
    .useValue(stdPriceSv)
    .compile();

  return module.get<PackageService>(PackageService);
}

async function getTestingStandardPriceService() {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      StandardPriceService,
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

  return module.get<StandardPriceService>(StandardPriceService);
}

async function getTestingBillsService(): Promise<BillsService> {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      BillsService,
      {
        provide: getRepositoryToken(Bill),
        useFactory: jest.fn(() => ({})),
      },
    ],
  }).compile();

  return module.get<BillsService>(BillsService);
}

async function getTestingLocationService() {
  const locHandleSv = await getTestingLocationHandleService();

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      LocationsService,
      LocationHandleService,
      {
        provide: getRepositoryToken(Location),
        useFactory: jest.fn(() => ({
          findOneBy: () => {
            const loc = new Location();
            loc.id = 1;
            loc.name = 'my bought location name';
            loc.status = LocationStatus.APPROVED;
            loc.version = 3;

            return loc;
          },
          findBy: (criteria) => {
            expect(criteria).toEqual({
              status: LocationStatus.APPROVED,
              safe_zone_bot: LessThanOrEqual(20.00135080372822),
              safe_zone_top: MoreThanOrEqual(19.99864919627178),
              safe_zone_left: LessThanOrEqual(100.00135080372822),
              safe_zone_right: MoreThanOrEqual(99.99864919627178),
            } as FindOptionsWhere<Location>);
            return [];
          },
        })),
      },
    ],
  })
    .overrideProvider(LocationHandleService)
    .useValue(locHandleSv)
    .compile();

  return module.get<LocationsService>(LocationsService);
}

async function getTestingLocationHandleService() {
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

async function getTestingUsersService(): Promise<UsersService> {
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
    providers: [
      UsersService,
      {
        provide: getRepositoryToken(User),
        useFactory: jest.fn(() => ({
          findOneBy: () => {
            const u = new User();
            u.id = -1;

            return u;
          },
        })),
      },
    ],
  }).compile();

  return module.get<UsersService>(UsersService);
}

const mockRedis = jest.fn(() => ({
  incr: jest.fn(() => 1),
  expire: jest.fn(() => true),
  get: jest.fn(() => {
    const stdPrice = new StandardPrice();
    stdPrice.price = 100;

    return JSON.stringify(stdPrice);
  }),
}));

async function initParamTestBuyByPackage() {
  const controller = await getOrderController();
  const dto = new CreateOrderDto();
  dto.type = PaymentType.PACKAGE;
  dto.user_package_id = 4;
  dto.location_id = 1;

  return {
    controller,
    dto,
  };
}

function validUserPackage(): UserPackage {
  return {
    id: 4,
    package_name: 'Premium combo x5',
    version: 2,
    package_id: 2,
    remaining_quantity: 4,
    quantity: 5,
    price: 500,
    purchase_status: UPackagePurchaseStatus.PAID,
  } as UserPackage
}
