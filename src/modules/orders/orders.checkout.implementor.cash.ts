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
import { LocationStatus } from '../locations/locations.contants';
import { BillsService } from '../bills/bills.service';
import { PaymentGatewayFactory } from './vendor_adapters/payment.vendor.adapters';
import { TransactionInfo } from './vendor_adapters/payment.types';
import { UPackagePurchaseStatus } from '../user_package/user_package.constants';

export class OrdersCheckoutImplementorCash
  implements OrdersCheckoutFlowInterface
{
  constructor(
    protected readonly user: User,
    protected readonly billsService: BillsService,
    protected readonly locationsService: LocationsService,
    protected readonly packageServices: PackageService,
    protected readonly standardPriceService: StandardPriceService,
  ) {}
  preValidate(dto: CreateOrderDto) {
    // required cash -> no user_package_id
    if (dto.user_package_id) {
      throw new BadRequestException();
    }
  }

  async validateData(pOrder: PrepareOrder) {
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
    txManager: EntityManager,
    order: Order,
    createOrderDto: CreateOrderDto,
    pOrder: PrepareOrder,
  ): Promise<Location | UserPackage> {
    const pkg = pOrder.pkg;
    let loc = pOrder.location;
    let userPackage: UserPackage;
    if (pkg) {
      userPackage = await this.createUserPackage(
        pkg,
        this.user.id,
        createOrderDto.owner_id,
        txManager,
      );
    } else if (!loc) {
      loc = await this.locationsService.create(
        Object.assign(new CreateLocationDto(), createOrderDto),
        this.user,
        createOrderDto.owner_id || this.user.id,
        txManager,
      );
      if (loc.status !== LocationStatus.APPROVED) {
        throw new InternalServerErrorException('Invalid distance');
      }
    }

    if (loc) {
      const result = await this.locationsService.checkout(
        txManager,
        loc.id,
        loc.version,
      );
      if (!result.affected) {
        throw new InternalServerErrorException(
          'Invalid version. Location has data changed',
        );
      }
    }
    return loc || userPackage;
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

  async createUserPackage(
    pkg: Package,
    buyer_id: number,
    owner_id: number,
    txManager: EntityManager,
  ): Promise<UserPackage> {
    const userPackage = new UserPackage();
    userPackage.package_id = pkg.id;
    userPackage.ref_id = pkg.ref_id;
    userPackage.user_id = owner_id || buyer_id;
    userPackage.package_name = pkg.name;
    userPackage.quantity = pkg.quantity;
    userPackage.remaining_quantity = pkg.quantity;
    userPackage.price = pkg.price;
    userPackage.purchase_status = UPackagePurchaseStatus.UNAUTHORIZED;
    userPackage.created_by_id = buyer_id;
    return txManager.getRepository(UserPackage).save(userPackage);
  }
}
