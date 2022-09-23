import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { EntityManager, FindManyOptions, Repository } from 'typeorm';
import { PaymentStatus, PaymentType } from './orders.constants';
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
import { UserPackage } from '../user_package/entities/user_package.entity';
import { Location } from '../locations/entities/location.entity';
import { Package } from '../package/entities/package.entity';
import { PackageService } from '../package/package.service';
import { OrdersCheckoutService } from './orders.checkout.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private readonly packageServices: PackageService,
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

  async remove(id: number) {
    return this.orderRepository.delete(id);
  }

  // Business
  async checkout(createOrderDto: CreateOrderDto, req: any, user: User) {
    const checkoutService = new OrdersCheckoutService(
      this.orderRepository,
      this.packageServices,
      this.billsService,
      this.locationsService,
      this.standardPriceService,
      user,
    );

    return checkoutService.checkout(createOrderDto, req);
  }
}
