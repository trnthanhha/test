import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
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

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
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

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.orderRepository.findOne({
      where: {
        id: id,
      },
    });

    if (order.version !== updateOrderDto.version)
      throw new Error('Update fail please try again');
    if (!PaymentStatus[order.payment_status])
      throw new Error('Payment status not found');
    if (!order) throw new Error('Not Found Order');

    Object.keys(updateOrderDto).forEach((v) => (order[v] = updateOrderDto[v]));
    order.version = order.version + 1;
    await this.orderRepository.save(order);

    return await this.orderRepository.update(id, updateOrderDto);
  }

  async create(order: Order, dbManager?: EntityManager) {
    return (dbManager?.getRepository(Order) || this.orderRepository).save(
      order,
    );
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
    const order = new Order();
    order.ref_uid = randomUUID();
    order.price = stdPrice.price;
    order.payment_status = PaymentStatus.UNAUTHORIZED;
    order.note = order.note || 'Thanh toan mua LocaMos dia diem';
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
        const insertedOrder = await this.create(order);
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
}
