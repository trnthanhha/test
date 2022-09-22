import { Controller } from '@nestjs/common';
import { ConsumersService } from './consumers.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller()
export class ConsumersController {
  constructor(private readonly consumersService: ConsumersService) {}

  @EventPattern('vnpay')
  updateVNPayOrder(@Payload() payload: any, @Ctx() ctx: RmqContext) {
    console.log('received message: ', payload);

    // this.ack(ctx);
  }

  ack(ctx) {
    const channel = ctx.getChannelRef();
    const originalMsg = ctx.getMessage();
    channel.ack(originalMsg);
  }
}
