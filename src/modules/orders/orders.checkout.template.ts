import { PrepareOrder } from './orders.checkout.types';
import { CheckoutDto } from './dto/checkout-dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { LocationsService } from '../locations/locations.service';
import { PackageService } from '../package/package.service';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { PaymentType } from './orders.constants';
import { OrdersCheckoutImplementorCash } from './orders.checkout.implementor.cash';
import { User } from '../users/entities/user.entity';
import { Order } from './entities/order.entity';
import { EntityManager } from 'typeorm';
import { BillsService } from '../bills/bills.service';
import { Location } from '../locations/entities/location.entity';
import { InternalServerErrorException } from '@nestjs/common';

export interface OrdersCheckoutFlowInterface {
  prepareData(dto: CreateOrderDto): Promise<PrepareOrder | CheckoutDto>;
  processBusiness(pOrder: PrepareOrder): Promise<Order>;
  processDBTransaction(
    order: Order,
    createOrderDto: CreateOrderDto,
    pOrder: PrepareOrder,
  );
  responseResult(req: any, created: Order, newLocation: Location);
}

export class OrderCheckoutFlowAbstraction {
  constructor(
    private readonly user: User,
    private readonly dbManager: EntityManager,
    private readonly billsService: BillsService,
    private readonly locationsService: LocationsService,
    private readonly packageServices: PackageService,
    private readonly standardPriceService: StandardPriceService,
  ) {}

  async checkout(createOrderDto: CreateOrderDto, req: any) {
    const flow = this.getFlow(createOrderDto);
    const preparedData = await flow.prepareData(createOrderDto);
    if (preparedData instanceof CheckoutDto) {
      // got failed
      return preparedData;
    }
    const order = await flow.processBusiness(preparedData);
    const inserted = await flow.processDBTransaction(
      order,
      createOrderDto,
      preparedData,
    );
    if (inserted.error) {
      return CheckoutDto.fail(
        new InternalServerErrorException(),
        inserted.error,
      );
    }

    return flow.responseResult(req, inserted, preparedData.location);
  }

  getFlow = (createOrderDto: CreateOrderDto): OrdersCheckoutFlowInterface => {
    switch (createOrderDto.type) {
      case PaymentType.CASH:
        return new OrdersCheckoutImplementorCash(
          this.user,
          this.dbManager,
          this.billsService,
          this.locationsService,
          this.packageServices,
          this.standardPriceService,
        );
      case PaymentType.PACKAGE:
        throw new Error('Unimplemented payment method');
      case PaymentType.POINT:
      default:
        throw new Error('Unimplemented payment method');
    }
  };
}
