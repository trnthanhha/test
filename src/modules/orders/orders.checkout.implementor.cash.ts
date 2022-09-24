import { OrdersCheckoutFlowInterface } from './orders.checkout.template';
import { Location } from '../locations/entities/location.entity';
import { Package } from '../package/entities/package.entity';
import { CheckoutDto } from './dto/checkout-dto';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrepareOrder } from './orders.checkout.types';
import { CreateOrderDto } from './dto/create-order.dto';
import { LocationsService } from '../locations/locations.service';
import { PackageService } from '../package/package.service';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { randomUUID } from 'crypto';
import { Order } from './entities/order.entity';
import { PaymentStatus } from './orders.constants';
import { User } from '../users/entities/user.entity';
import { EntityManager } from 'typeorm';
import { UserPackage } from '../user_package/entities/user_package.entity';
import { CreateLocationDto } from '../locations/dto/create-location.dto';
import { LocationStatus } from '../locations/locations.contants';
import { BillsService } from '../bills/bills.service';
import { Bill } from '../bills/entities/bill.entity';
import { BillStatus, PaymentVendor } from '../bills/bills.constants';
import { PaymentGatewayFactory } from './vendor_adapters/payment.vendor.adapters';

export class OrdersCheckoutImplementorCash
  implements OrdersCheckoutFlowInterface
{
  constructor(
    private readonly user: User,
    private readonly dbManager: EntityManager,
    private readonly billsService: BillsService,
    private readonly locationsService: LocationsService,
    private readonly packageServices: PackageService,
    private readonly standardPriceService: StandardPriceService,
  ) {}

  async prepareData(
    createOrderDto: CreateOrderDto,
  ): Promise<PrepareOrder | CheckoutDto> {
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

    return {
      pkg,
      location: loc,
      stdPrice: stdPrice,
    };
  }

  async processBusiness(pOrder: PrepareOrder): Promise<Order> {
    const { pkg, stdPrice } = pOrder;

    return this.initOrder(pkg?.price || stdPrice.price);
  }

  async processDBTransaction(
    order: Order,
    createOrderDto: CreateOrderDto,
    pOrder: PrepareOrder,
  ) {
    const pkg = pOrder.pkg;
    let loc = pOrder.location;
    return await this.dbManager.transaction(
      async (entityManager): Promise<Order | any> => {
        let userPackage: UserPackage;
        if (pkg) {
          userPackage = await this.createUserPackage(
            pkg,
            this.user,
            entityManager,
          );
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
        const insertedOrder = await this.dbManager
          .getRepository(Order)
          .save(order);
        await this.billsService.create(
          this.initBill(insertedOrder),
          entityManager,
        );

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
      },
    );
  }

  responseResult(req: any, created: Order, newLocation: Location) {
    const pmGateway = PaymentGatewayFactory.Build();

    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const redirectUrl = pmGateway.generateURLRedirect(
      {
        uuid: created.ref_uid,
        note: created.note,
        price: created.price,
      },
      ipAddr,
    );
    return CheckoutDto.success(redirectUrl, newLocation);
  }

  initOrder(price: number): Order {
    const order = new Order();
    order.ref_uid = randomUUID();
    order.price = price;
    order.payment_status = PaymentStatus.UNAUTHORIZED;
    order.note = order.note || 'Thanh toan mua LocaMos dia diem';
    order.created_by_id = this.user.id;

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
}
