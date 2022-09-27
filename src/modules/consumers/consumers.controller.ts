import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { PaymentService } from '../../services/payment/payment.service';
import { PrepareError } from '../../errors/types';
import { PaymentStatus, PaymentType } from '../orders/orders.constants';
import { TransactionInfo } from '../orders/vendor_adapters/payment.types';

@Controller()
export class ConsumersController {
  private readonly logger = new Logger(ConsumersController.name);
  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern('vnpay')
  async updateVNPayOrder(@Payload() payload: any, @Ctx() ctx: RmqContext) {
    this.logger.log('receive message IPN from VNPay, value: ', payload);
    const {
      vnp_ResponseCode,
      vnp_TxnRef: uuid,
      vnp_TransactionNo: invoice_number,
    } = payload;
    const status =
      (vnp_ResponseCode === '00' && PaymentStatus.PAID) || PaymentStatus.FAILED;

    await this.paymentService
      .syncOrderStatus({ uuid, status, invoice_number })
      .then(() => {
        this.ack(ctx);
      })
      .catch((ex) => {
        if (
          ex instanceof PrepareError ||
          ex?.message?.includes(
            'duplicate key value violates unique constraint',
          )
        ) {
          this.drop(ctx);
          return;
        }
        this.requeue(ctx);
      });
  }

  @EventPattern('locamos')
  async updateLocaMosSystem(
    @Payload() payload: { info: TransactionInfo; type: PaymentType },
    @Ctx() ctx: RmqContext,
  ) {
    this.logger.log('receive message to sync LocaMos, value: ', payload);
    if (payload.type) {
      return;
    }
    switch (payload.type) {
      case PaymentType.PACKAGE:
      case PaymentType.POINT:
        await this.paymentService
          .syncOrderStatus({
            uuid: payload.info.uuid,
            status: PaymentStatus.PAID,
            invoice_number: null,
          })
          .then(() => {
            this.ack(ctx);
          })
          .catch((ex) => {
            if (
              ex instanceof PrepareError ||
              ex?.message?.includes(
                'duplicate key value violates unique constraint',
              )
            ) {
              this.drop(ctx);
              return;
            }
            this.requeue(ctx);
          });
    }
  }

  ack(ctx) {
    const channel = ctx.getChannelRef();
    const originalMsg = ctx.getMessage();
    channel.ack(originalMsg);
  }

  requeue(ctx) {
    const channel = ctx.getChannelRef();
    const originalMsg = ctx.getMessage();
    channel.reject(originalMsg, true);
  }

  drop(ctx) {
    const channel = ctx.getChannelRef();
    const originalMsg = ctx.getMessage();
    channel.reject(originalMsg, false);
  }
}
