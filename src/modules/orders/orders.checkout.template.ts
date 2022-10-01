import { PrepareOrder } from './orders.checkout.types';
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
import { Bill } from '../bills/entities/bill.entity';
import { BillStatus, PaymentVendor } from '../bills/bills.constants';
import { Location } from '../locations/entities/location.entity';
import { UserPackage } from '../user_package/entities/user_package.entity';
import { ClientProxy } from '@nestjs/microservices';
import { OrdersCheckoutImplementorPoint } from './orders.checkout.implementor.point';
import { HttpService } from '@nestjs/axios';

export interface OrdersCheckoutFlowInterface {
  preValidate(dto: CreateOrderDto);
  prepareData(dto: CreateOrderDto): Promise<PrepareOrder>;
  validateData(pOrder: PrepareOrder): Promise<void>;
  processBusiness(pOrder: PrepareOrder): Promise<Order>;
  processDBTransaction(
    txManager: EntityManager,
    order: Order,
    createOrderDto: CreateOrderDto,
    pOrder: PrepareOrder,
  ): Promise<any>;
  responseResult(req: any, info: TransactionInfo, newItem: any): Promise<any>;
}

export class OrderCheckoutFlowAbstraction {
  constructor(
    private readonly httpService: HttpService,
    private readonly publisher: ClientProxy,
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

    await flow.validateData(preparedData);
    // -- Business logic
    const order = await flow.processBusiness(preparedData);
    order.ref_uid = randomUUID();

    // -- Start db execution
    const result = await this.dbManager.transaction(async (txManager) => {
      const inserted = await flow.processDBTransaction(
        txManager,
        order,
        dto,
        preparedData,
      );

      order.location_id = inserted instanceof Location ? inserted.id : null;
      order.user_package_id =
        inserted instanceof UserPackage ? inserted.id : null;
      const insertedOrder = await txManager.getRepository(Order).save(order);
      await this.billsService.create(this.initBill(insertedOrder), txManager);

      return inserted;
    });

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
          this.publisher,
          this.user,
          this.dbManager,
          this.billsService,
          this.locationsService,
        );
      case PaymentType.POINT:
        return new OrdersCheckoutImplementorPoint(
          this.httpService,
          this.publisher,
          this.dbManager,
          this.user,
          this.billsService,
          this.locationsService,
          this.packageServices,
          this.standardPriceService,
        );
      default:
        throw new Error('Unimplemented payment method');
    }
  };

  initBill(order: Order): Bill {
    const bill = new Bill();
    bill.order_id = order.id;
    bill.ref_id = order.ref_uid;
    bill.status = BillStatus.UNAUTHORIZED;
    bill.created_by_id = order.created_by_id;
    bill.vendor = PaymentVendor.VNPAY;

    return bill;
  }
}
