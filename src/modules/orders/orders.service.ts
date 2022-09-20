import { Injectable, Logger } from '@nestjs/common';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { PaymentStatus } from './orders.constants';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
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

  async remove(id: number) {
    return this.orderRepository.delete(id);
  }
}
