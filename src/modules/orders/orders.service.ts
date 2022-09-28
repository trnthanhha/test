import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import {
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
  MoreThan,
  Repository,
} from 'typeorm';
import { PaymentStatus } from './orders.constants';
import { CreateOrderDto } from './dto/create-order.dto';
import { LocationsService } from '../locations/locations.service';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { User } from '../users/entities/user.entity';
import { BillsService } from '../bills/bills.service';
import { PackageService } from '../package/package.service';
import { OrderCheckoutFlowAbstraction } from './orders.checkout.template';
import { RabbitMQServices } from '../../services/message-broker/webhook.types';
import { ClientProxy } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { PaginationResult } from '../../utils/pagination';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(RabbitMQServices.VNPay) private readonly publisher: ClientProxy,
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
    target?: string;
    payment_status: string;
  }) {
    const page = +query.page || 1;
    const limit = +query.limit || 20;
    const paymentStatus = query.payment_status as PaymentStatus;
    const where: FindOptionsWhere<Order> = {
      payment_status: paymentStatus || undefined,
    };

    switch (query.target) {
      case 'location':
        where.location_id = MoreThan(0);
        break;
      case 'combo':
      default:
        where.user_package_id = MoreThan(0);
    }

    const options: FindManyOptions<Order> = {
      where,
      skip: (page - 1) * limit,
      take: limit,
    };

    const [orders, total] = await this.orderRepository.findAndCount(options);
    return new PaginationResult<Order>(orders, total, limit);
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
    const checkoutFlow = new OrderCheckoutFlowAbstraction(
      this.httpService,
      this.publisher,
      user,
      this.orderRepository.manager,
      this.billsService,
      this.locationsService,
      this.packageServices,
      this.standardPriceService,
    );

    return checkoutFlow.checkout(createOrderDto, req);
  }
}
