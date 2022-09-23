import { Order } from './entities/order.entity';
import { EntityManager, Repository } from 'typeorm';
import { PackageService } from '../package/package.service';
import { BillsService } from '../bills/bills.service';
import { LocationsService } from '../locations/locations.service';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { User } from '../users/entities/user.entity';
import { PaymentStatus, PaymentType } from './orders.constants';
import { UserPackage } from '../user_package/entities/user_package.entity';
import { CheckoutDto } from './dto/checkout-dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { BillStatus, PaymentVendor } from '../bills/bills.constants';
import { CreateOrderDto } from './dto/create-order.dto';
import { randomUUID } from 'crypto';
import { Bill } from '../bills/entities/bill.entity';
import { Package } from '../package/entities/package.entity';
import { Location } from '../locations/entities/location.entity';
import { PaymentGatewayFactory } from './vendor_adapters/payment.vendor.adapters';
import { CreateLocationDto } from '../locations/dto/create-location.dto';
import { LocationStatus } from '../locations/locations.contants';

export class OrdersCheckoutService {
  constructor(
    private orderRepository: Repository<Order>,
    private readonly packageServices: PackageService,
    private readonly billsService: BillsService,
    private readonly locationsService: LocationsService,
    private readonly standardPriceService: StandardPriceService,
    private readonly user: User,
  ) {}

  async checkout(createOrderDto: CreateOrderDto, req: any) {
    switch (createOrderDto.type) {
      case PaymentType.CASH:
        return this.chargeByCash(createOrderDto, req);
      case PaymentType.PACKAGE:
        break;
      case PaymentType.POINT:
      default:
        throw new Error('Unimplemented payment method');
    }
    const dbManager: EntityManager = this.orderRepository.manager;
    const userPackage = await dbManager
      .getRepository(UserPackage)
      .findOneBy({ id: createOrderDto.user_package_id });
    //-----------Validate
    if (!userPackage) {
      return CheckoutDto.fail(
        new BadRequestException(),
        'User not exist any packages',
      );
    }

    if (userPackage.remaining_quantity <= 0) {
      return CheckoutDto.fail(
        new BadRequestException(),
        'Remaining quantity of package is not enough',
      );
    }

    const order = this.initOrder(1);
    order.payment_type = PaymentType.PACKAGE;
    order.payment_status = PaymentStatus.PAID;

    const bill = this.initBill(order);
    bill.status = BillStatus.PAID;
    bill.vendor = PaymentVendor.LOCAMOS;
  }

  initOrder(price: number): Order {
    const order = new Order();
    order.ref_uid = randomUUID();
    order.price = price;
    order.payment_status = PaymentStatus.UNAUTHORIZED;
    order.note = order.note || 'Thanh toan mua LocaMos dia diem';

    return order;
  }

  initBill(order: Order): Bill {
    const bill = new Bill();
    bill.order_id = order.id;
    bill.ref_id = order.ref_uid;
    bill.status = BillStatus.UNAUTHORIZED;
    bill.created_by_id = order.created_by_id;
    bill.vendor = PaymentVendor.VNPAY;

    return bill;
  }

  async createUserPackage(
    pkg: Package,
    user: User,
    entityManager: EntityManager,
  ): Promise<UserPackage> {
    const userPackage = new UserPackage();
    userPackage.package_id = pkg.id;
    userPackage.user_id = user.id;
    userPackage.package_name = pkg.name;
    userPackage.quantity = pkg.quantity;
    userPackage.remaining_quantity = pkg.quantity;
    return entityManager.getRepository(UserPackage).save(userPackage);
  }

  async chargeByCash(createOrderDto: CreateOrderDto, req: any) {
    let loc: Location;
    let pkg: Package;
    if (createOrderDto.location_id > 0) {
      loc = await this.locationsService.findOne(createOrderDto.location_id);
      if (!loc.canPurchased()) {
        return CheckoutDto.fail(
          new BadRequestException(),
          'Location is unable to purchase',
        );
      }
    } else if (createOrderDto.package_id > 0) {
      pkg = await this.packageServices.findOne(createOrderDto.package_id);
    }

    const stdPrice = await this.standardPriceService.getStandardPrice();
    if (!stdPrice) {
      return CheckoutDto.fail(
        new InternalServerErrorException(),
        'Cant get price to purchase',
      );
    }

    const pmGateway = PaymentGatewayFactory.Build();
    const order = this.initOrder(pkg?.price || stdPrice.price);
    order.created_by_id = this.user.id;

    const created = await this.orderRepository.manager.transaction(
      async (entityManager): Promise<Order | any> => {
        return this.chargeAndCreateBill(
          createOrderDto,
          order,
          pkg,
          loc,
          entityManager,
        );
      },
    );

    if (created.error) {
      return CheckoutDto.fail(
        new InternalServerErrorException(),
        created.error,
      );
    }

    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const redirectUrl = pmGateway.generateURLRedirect(created, ipAddr);
    return CheckoutDto.success(redirectUrl, loc);
  }

  async chargeAndCreateBill(
    createOrderDto: CreateOrderDto,
    order: Order,
    pkg: Package,
    loc: Location,
    entityManager: EntityManager,
  ) {
    let userPackage: UserPackage;
    if (pkg) {
      userPackage = await this.createUserPackage(pkg, this.user, entityManager);
    } else if (!loc) {
      loc = await this.locationsService.create(
        Object.assign(new CreateLocationDto(), createOrderDto),
        this.user,
        entityManager,
      );
      if (loc.status !== LocationStatus.APPROVED) {
        return {
          error: 'Invalid distance',
        };
      }
    }

    order.location_id = loc?.id;
    order.user_package_id = userPackage?.id;
    const insertedOrder = await this.create(order, entityManager);
    await this.billsService.create(this.initBill(insertedOrder), entityManager);

    if (loc) {
      const result = await this.locationsService.checkout(
        entityManager,
        loc.id,
        loc.version,
      );
      if (!result.affected) {
        return {
          error: 'Invalid version. Location has data changed',
        };
      }
    }
    return insertedOrder;
  }

  async create(order: Order, dbManager?: EntityManager) {
    const repo = dbManager?.getRepository(Order) || this.orderRepository;
    return repo.save(order);
  }
}
