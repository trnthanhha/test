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
import { Order } from './entities/order.entity';
import { PaymentStatus } from './orders.constants';
import { User } from '../users/entities/user.entity';
import { EntityManager } from 'typeorm';
import { UserPackage } from '../user_package/entities/user_package.entity';
import { CreateLocationDto } from '../locations/dto/create-location.dto';
import {
  LocationPurchaseStatus,
  LocationStatus,
} from '../locations/locations.contants';
import { BillsService } from '../bills/bills.service';
import { Bill } from '../bills/entities/bill.entity';
import { BillStatus, PaymentVendor } from '../bills/bills.constants';
import { PaymentGatewayFactory } from './vendor_adapters/payment.vendor.adapters';
import { TransactionInfo } from './vendor_adapters/payment.types';
import { UPackagePurchaseStatus } from '../user_package/user_package.constants';

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
  preValidate(dto: CreateOrderDto) {
    // required cash -> no user_package_id
    if (dto.user_package_id) {
      throw new BadRequestException();
    }
  }

  validateData(pOrder: PrepareOrder) {
    // required cash -> no user_package_id
    const { location, stdPrice } = pOrder;
    if (location && !location.canPurchased()) {
      throw new BadRequestException('Location is unable to purchase');
    }

    if (!stdPrice || !stdPrice.price) {
      throw new InternalServerErrorException('Cant get price to purchase');
    }
  }

  async prepareData(createOrderDto: CreateOrderDto): Promise<PrepareOrder> {
    let loc: Location;
    let pkg: Package;
    if (createOrderDto.location_id > 0) {
      loc = await this.locationsService.findOne(createOrderDto.location_id);
    } else if (createOrderDto.package_id > 0) {
      pkg = await this.packageServices.findOne(createOrderDto.package_id);
    }

    const stdPrice = await this.standardPriceService.getStandardPrice();
    return {
      pkg,
      location: loc,
      stdPrice: stdPrice,
    };
  }

  async processBusiness(pOrder: PrepareOrder): Promise<Order> {
    const { pkg, stdPrice } = pOrder;
    let price;
    let note;
    if (pkg) {
      // buy combo
      price = pkg.price; // calculated by pkg.quantity * stdPrice.price
      note = 'Thanh toan mua LocaMos package/combo';
    } else {
      price = stdPrice.price;
      note = 'Thanh toan mua LocaMos dia diem';
    }
    return this.initOrder(price, note);
  }

  async processDBTransaction(
    order: Order,
    createOrderDto: CreateOrderDto,
    pOrder: PrepareOrder,
  ): Promise<Location | UserPackage> {
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
            return CheckoutDto.fail(
              new InternalServerErrorException(),
              'Invalid distance',
            );
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
            LocationPurchaseStatus.UNAUTHORIZED,
          );
          if (!result.affected) {
            return CheckoutDto.fail(
              new InternalServerErrorException(),
              'Invalid version. Location has data changed',
            );
          }
        }
        return loc || userPackage;
      },
    );
  }

  responseResult(
    req: any,
    info: TransactionInfo,
    newItem: Location | UserPackage,
  ) {
    const pmGateway = PaymentGatewayFactory.Build();

    const ipAddr =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const redirectUrl = pmGateway.generateURLRedirect(info, ipAddr);
    return CheckoutDto.success(redirectUrl, newItem);
  }

  initOrder(price: number, note: string): Order {
    const order = new Order();
    order.price = price;
    order.payment_status = PaymentStatus.UNAUTHORIZED;
    order.note = note;
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
    userPackage.price = pkg.price;
    userPackage.purchase_status = UPackagePurchaseStatus.UNAUTHORIZED;
    return entityManager.getRepository(UserPackage).save(userPackage);
  }
}
