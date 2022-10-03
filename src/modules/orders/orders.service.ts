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
import { PaymentStatus, PaymentType } from './orders.constants';
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
import { CheckoutBillAddress } from './dto/checkout-dto';

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

  async findAllOrderPointHistory(
    pagination: {
      page?: string;
      limit?: string;
    },
    user: User,
  ) {
    const page = +pagination.page || 1;
    const limit = +pagination.limit || 20;

    const options: FindManyOptions<Order> = {
      where: {
        payment_type: PaymentType.POINT,
        created_by_id: user.id,
      },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [orders, total] = await this.orderRepository.findAndCount(options);
    return new PaginationResult<Order>(orders, total, limit);
  }

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
    this.reSyncUserInfo(createOrderDto, user);
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

  reSyncUserInfo(createOrderDto: CreateOrderDto, user: User) {
    const phone_number: string = createOrderDto.phone_number.replace('+', '');
    const prevObject = new CheckoutBillAddress(user);
    const nextObject = new CheckoutBillAddress(createOrderDto);
    const prevValue = JSON.stringify(prevObject);
    const nextValue = JSON.stringify(nextObject);
    console.log(prevValue === nextValue);

    return this.orderRepository.manager.getRepository(User).update(
      {
        id: user.id,
      },
      {
        phone_number,
        identification_number: createOrderDto.identification_number,
        identification_created_from: createOrderDto.identification_created_from,
        identification_created_at: new Date(
          createOrderDto.identification_created_at,
        ),
        province: createOrderDto.province,
        district: createOrderDto.district,
        address: createOrderDto.address,
      },
    );
  }
}
