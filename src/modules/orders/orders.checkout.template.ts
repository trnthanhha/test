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
import { TransactionInfo } from './vendor_adapters/payment.types';
import { OrdersCheckoutImplementorPackage } from './orders.checkout.implementor.package';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface OrdersCheckoutFlowInterface {
  preValidate(dto: CreateOrderDto);
  prepareData(dto: CreateOrderDto): Promise<PrepareOrder>;
  validateData(pOrder: PrepareOrder);
  processBusiness(pOrder: PrepareOrder): Promise<Order>;
  processDBTransaction(
    order: Order,
    createOrderDto: CreateOrderDto,
    pOrder: PrepareOrder,
  ): Promise<any>;
  responseResult(req: any, info: TransactionInfo, newItem: any);
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

  async checkout(dto: CreateOrderDto, req: any) {
    // -- Base validate
    if (
      // buy exist location
      !dto.location_id &&
      // or? new custom location -> need lat + long + name + map_captured
      (!dto.lat || !dto.long || !dto.name || !dto.map_captured) &&
      // or? buy package?
      !dto.package_id
    ) {
      throw new BadRequestException();
    }

    // -- Choose flow
    const flow = this.getFlow(dto);
    // -- Custom validate by flow
    flow.preValidate(dto);
    const preparedData = await flow.prepareData(dto);
    flow.validateData(preparedData);
    // -- Business logic
    const order = await flow.processBusiness(preparedData);
    order.ref_uid = randomUUID();

    // -- Start db execution
    const result = await flow.processDBTransaction(order, dto, preparedData);
    if (result instanceof CheckoutDto) {
      // got failed
      return result;
    }

    return flow.responseResult(
      req,
      {
        price: order.price,
        note: order.note,
        uuid: order.ref_uid,
      },
      result,
    );
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
        return new OrdersCheckoutImplementorPackage(
          this.user,
          this.dbManager,
          this.billsService,
          this.locationsService,
        );
      case PaymentType.POINT:
      default:
        throw new Error('Unimplemented payment method');
    }
  };
}
