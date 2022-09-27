import { OrdersCheckoutFlowInterface } from './orders.checkout.template';
import { OrdersCheckoutImplementorCash } from './orders.checkout.implementor.cash';
import { User } from '../users/entities/user.entity';
import { BillsService } from '../bills/bills.service';
import { LocationsService } from '../locations/locations.service';
import { PackageService } from '../package/package.service';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { ClientProxy } from '@nestjs/microservices';
import { PrepareOrder } from './orders.checkout.types';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { LocamosLinkageService } from '../../services/locamos-linkage/user.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { TransactionInfo } from './vendor_adapters/payment.types';
import { PaymentStatus, PaymentType } from './orders.constants';
import { CheckoutDto } from './dto/checkout-dto';
import { Order } from './entities/order.entity';
import { EntityManager, In } from 'typeorm';

export class OrdersCheckoutImplementorPoint
  extends OrdersCheckoutImplementorCash
  implements OrdersCheckoutFlowInterface
{
  constructor(
    private readonly httpService: HttpService,
    private readonly publisher: ClientProxy,
    private readonly dbManager: EntityManager,
    user: User,
    billsService: BillsService,
    locationsService: LocationsService,
    packageServices: PackageService,
    standardPriceService: StandardPriceService,
  ) {
    super(
      user,
      billsService,
      locationsService,
      packageServices,
      standardPriceService,
    );
  }

  preValidate(dto: CreateOrderDto) {
    super.preValidate(dto);

    if (!dto.package_id || dto.location_id > 0) {
      throw new BadRequestException(
        'Only allow buy package/combo with Locamos Point',
      );
    }
  }

  async validateData(pOrder: PrepareOrder) {
    const existed = await this.dbManager.getRepository(Order).find({
      where: {
        created_by_id: this.user.id,
        payment_type: PaymentType.POINT,
        payment_status: PaymentStatus.UNAUTHORIZED,
      },
      take: 1,
    });
    if (existed?.length) {
      throw new BadRequestException('Existed order paid by point unauthorized');
    }

    const { location, pkg } = pOrder;
    if (location && !location.canPurchased()) {
      throw new BadRequestException('Location is unable to purchase');
    }

    if (!pkg || !pkg.price_usd) {
      throw new NotFoundException(
        'not found package to buy || package cant buy with point',
      );
    }

    await this.validateCurrentPointEnough(pkg.price_usd || 0);
  }

  async processBusiness(pOrder: PrepareOrder): Promise<Order> {
    return this.initOrder(pOrder.pkg.price_usd);
  }

  responseResult(req: any, info: TransactionInfo, newItem: any) {
    this.publisher.emit('locamos', {
      info,
      type: PaymentType.POINT,
    });

    return CheckoutDto.success('', newItem);
  }

  async validateCurrentPointEnough(price: number) {
    if (!this.user?.locamos_access_token) {
      throw new NotFoundException('User is not created from LocaMos');
    }

    const userInfo = await new LocamosLinkageService(
      this.httpService,
    ).getProfile(this.user.locamos_access_token);

    const totalPoint = parseFloat(userInfo?.wallet?.usd?.replace?.(/,/g, ''));
    if (!totalPoint || totalPoint < price) {
      throw new BadRequestException('Not enough point to buy');
    }
  }

  initOrder(price: number): Order {
    const order = new Order();
    order.price = price;
    order.payment_type = PaymentType.POINT;
    order.payment_status = PaymentStatus.UNAUTHORIZED;
    order.note = 'Thanh toan mua LocaMos package/combo';
    order.created_by_id = this.user.id;

    return order;
  }
}
