import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrdersService } from '../../modules/orders/orders.service';
import { PaymentStatus } from '../../modules/orders/orders.constants';
import { Bill } from '../../modules/bills/entities/bill.entity';
import { Order } from '../../modules/orders/entities/order.entity';
import { BillStatus } from '../../modules/bills/bills.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillsService } from '../../modules/bills/bills.service';
import { PrepareError } from '../../errors/types';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly billsService: BillsService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  @Cron('*/30 * * * * *')
  syncPaymentStatus() {
    // console.log('sync payment status each 30s');
  }

  async syncOrderStatus(payload: any) {
    const { vnp_ResponseCode, vnp_TxnRef, vnp_TransactionNo } = payload;
    let bill: Bill;
    let order: Order;
    try {
      bill = await this.billsService.findOneByRefID(vnp_TxnRef);
      order = bill.order;
      if (order.payment_status === PaymentStatus.PAID) {
        this.logger.log('order closed, no need to sync, orderID: ', order.id);
        throw new BadRequestException();
      }

      order.payment_status =
        (vnp_ResponseCode === '00' && PaymentStatus.PAID) ||
        PaymentStatus.FAILED;

      bill.status = this.orderStatusToBillStatus(order.payment_status);
      bill.invoice_number = vnp_TransactionNo;
    } catch (ex) {
      throw new PrepareError(ex, 'Not found order');
    }

    return this.orderRepository.manager.transaction(
      (entityManager): Promise<any[]> => {
        return Promise.all([
          this.ordersService.update(order.id, order, entityManager),
          this.billsService.update(bill, entityManager),
        ]);
      },
    );
  }

  orderStatusToBillStatus(pmStt: PaymentStatus): BillStatus {
    for (const stt in BillStatus) {
      if (pmStt === BillStatus[stt]) {
        return BillStatus[stt];
      }
    }

    return BillStatus.UNAUTHORIZED;
  }
}
