import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { EntityManager, FindManyOptions, Repository } from 'typeorm';
import { PaymentStatus } from './orders.constants';
import { CheckoutDto } from './dto/checkout-dto';
import { PaymentGatewayFactory } from './vendor_adapters/payment.vendor.adapters';
import { randomUUID } from 'crypto';
import { CreateLocationDto } from '../locations/dto/create-location.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { LocationsService } from '../locations/locations.service';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { User } from '../users/entities/user.entity';
import { LocationStatus } from '../locations/locations.contants';
import { Bill } from '../bills/entities/bill.entity';
import { BillStatus, PaymentVendor } from '../bills/bills.constants';
import { BillsService } from '../bills/bills.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private readonly billsService: BillsService,
    private readonly locationsService: LocationsService,
    private readonly standardPriceService: StandardPriceService,
  ) {}

  async findAll(query: {
    page?: string;
    limit?: string;
    payment_status: string;
  }) {
    const page = +query.page || 1;
    const limit = +query.limit || 10;
    const paymentStatus = query.payment_status as PaymentStatus;

    const options: FindManyOptions<Order> = {
      where: paymentStatus ? { payment_status: paymentStatus } : {},
      skip: (page - 1) * limit,
      take: limit,
    };

    const [orders, total] = await this.orderRepository.findAndCount(options);

    return {
      data: orders,
      meta: {
        page_size: limit,
        total_page: Math.ceil(total / limit),
        total_records: total,
      },
    };
  }

  async findOne(id: number): Promise<Order> {
    return await this.orderRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async findOneByRefID(ref_uid: string): Promise<Order> {
    return await this.orderRepository.findOne({
      where: {
        ref_uid,
      },
      relations: {
        location: true,
        user_package: true,
      },
    });
  }

  async update(id: number, order: Order, dbManager?: EntityManager) {
    const repo = dbManager?.getRepository(Order) || this.orderRepository;
    const rs = await repo.update(
      { id, version: order.version },
      Object.assign(order, { version: order.version + 1 }),
    );
    if (!rs.affected) {
      throw new Error('update handle failed, criteria not match');
    }
  }

  async create(order: Order, dbManager?: EntityManager) {
    const repo = dbManager?.getRepository(Order) || this.orderRepository;
    return repo.save(order);
  }

  async remove(id: number) {
    return this.orderRepository.delete(id);
  }

  // Business
  async checkout(createOrderDto: CreateOrderDto, req: any, user: User) {
    let loc;
    if (createOrderDto.location_id > 0) {
      loc = loc = await this.locationsService.findOne(
        createOrderDto.location_id,
      );
      if (!loc.canPurchased()) {
        return CheckoutDto.fail(
          new BadRequestException(),
          'Location is unable to purchase',
        );
      }
    }

    const stdPrice = await this.standardPriceService.getStandardPrice();
    if (!stdPrice) {
      return CheckoutDto.fail(
        new InternalServerErrorException(),
        'Cant get price to purchase',
      );
    }

    const pmGateway = PaymentGatewayFactory.Build();
    const order = this.initOrder(stdPrice.price);
    order.created_by_id = user.id;

    const created = await this.orderRepository.manager.transaction(
      async (entityManager): Promise<Order | any> => {
        if (!loc) {
          loc = await this.locationsService.create(
            Object.assign(new CreateLocationDto(), createOrderDto),
            user,
            entityManager,
          );
        }
        if (loc.status !== LocationStatus.APPROVED) {
          return {
            error: 'Invalid distance',
          };
        }

        order.location_id = loc.id;
        const insertedOrder = await this.create(order, entityManager);
        await this.billsService.create(
          this.initBill(insertedOrder),
          entityManager,
        );

        const result = await this.locationsService.checkout(
          entityManager,
          loc.id,
          loc.version,
          insertedOrder.id,
        );
        if (!result.affected) {
          return {
            error: 'Invalid version. Location has data changed',
          };
        }
        return insertedOrder;
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
}
