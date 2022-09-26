import { OrdersCheckoutFlowInterface } from './orders.checkout.template';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrepareOrder } from './orders.checkout.types';
import { CheckoutDto } from './dto/checkout-dto';
import { Order } from './entities/order.entity';
import { TransactionInfo } from './vendor_adapters/payment.types';
import { User } from '../users/entities/user.entity';
import { EntityManager } from 'typeorm';
import { BillsService } from '../bills/bills.service';
import { LocationsService } from '../locations/locations.service';
import { Location } from '../locations/entities/location.entity';
import { UserPackage } from '../user_package/entities/user_package.entity';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PaymentStatus, PaymentType } from './orders.constants';
import { CreateLocationDto } from '../locations/dto/create-location.dto';
import { LocationStatus } from '../locations/locations.contants';
import { ClientProxy } from '@nestjs/microservices';

export class OrdersCheckoutImplementorPackage
  implements OrdersCheckoutFlowInterface
{
  constructor(
    private readonly publisher: ClientProxy,
    private readonly user: User,
    private readonly dbManager: EntityManager,
    private readonly billsService: BillsService,
    private readonly locationsService: LocationsService,
  ) {}
  preValidate(dto: CreateOrderDto) {
    if (!dto.user_package_id || dto.user_package_id <= 0) {
      throw new BadRequestException();
    }
  }

  async validateData(pOrder: PrepareOrder) {
    const { userPkg, location } = pOrder;
    if (!userPkg || !userPkg.isUsable()) {
      throw new BadRequestException(
        'User not exist package || zero quantity || package unpaid',
      );
    }

    if (location && !location.canPurchased()) {
      throw new BadRequestException('Location is unable to purchase');
    }
  }

  async prepareData(dto: CreateOrderDto): Promise<PrepareOrder> {
    const jobs = [];
    if (dto.location_id > 0) {
      jobs.push(
        this.dbManager
          .getRepository(Location)
          .findOneBy({ id: dto.location_id }),
      );
    } else {
      jobs.push(undefined);
    }

    jobs.push(
      this.dbManager
        .getRepository(UserPackage)
        .findOneBy({ id: dto.user_package_id }),
    );
    const [loc, userPackage] = await Promise.all(jobs);

    return {
      location: loc,
      userPkg: userPackage,
    } as PrepareOrder;
  }

  async processBusiness(pOrder: PrepareOrder): Promise<Order> {
    // init order, reduce user's package quantity
    pOrder.userPkg.remaining_quantity--;

    return this.initOrder(pOrder.userPkg);
  }

  async processDBTransaction(
    txManager: EntityManager,
    order: Order,
    createOrderDto: CreateOrderDto,
    pOrder: PrepareOrder,
  ): Promise<any> {
    let loc = pOrder.location;
    if (!loc) {
      loc = await this.locationsService.create(
        Object.assign(new CreateLocationDto(), createOrderDto),
        this.user,
        txManager,
      );
      if (loc.status !== LocationStatus.APPROVED) {
        throw new InternalServerErrorException('Invalid distance');
      }
    }

    const userPkg = pOrder.userPkg;
    await txManager.getRepository(UserPackage).update(
      { id: userPkg.id, version: userPkg.version },
      {
        version: userPkg.version + 1,
        remaining_quantity: userPkg.remaining_quantity,
      },
    );

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
    return loc;
  }

  responseResult(req: any, info: TransactionInfo, newItem: any) {
    this.publisher.emit('locamos', {
      info,
      type: PaymentType.PACKAGE,
    });

    return CheckoutDto.success('', newItem);
  }

  initOrder(userPkg: UserPackage) {
    const order = new Order();
    order.price = userPkg.price / userPkg.quantity;
    order.payment_type = PaymentType.PACKAGE;
    order.payment_status = PaymentStatus.UNAUTHORIZED;
    order.note = 'Thanh toan mua LocaMos dia diem su dung package';
    order.created_by_id = userPkg.user_id;

    return order;
  }
}
