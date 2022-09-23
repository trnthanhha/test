import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { PaymentService } from '../../services/payment/payment.service';
import { PrepareError } from '../../errors/types';

@Controller()
export class ConsumersController {
  constructor(private readonly paymentService: PaymentService) {}

  @EventPattern('vnpay')
  async updateVNPayOrder(@Payload() payload: any, @Ctx() ctx: RmqContext) {
    await this.paymentService
      .syncOrderStatus(payload)
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
