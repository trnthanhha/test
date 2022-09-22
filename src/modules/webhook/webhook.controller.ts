import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Inject,
  Req,
  Get,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMQServices } from '../../services/message-broker/webhook.types';

@Controller('webhook')
@UseInterceptors(ClassSerializerInterceptor)
export default class WebhookController {
  constructor(@Inject(RabbitMQServices.VNPay) private publisher: ClientProxy) {}

  @Get('vnpay')
  async storeVNPayMessage(@Req() req) {
    return this.publisher.emit('vnpay', req.query);
  }
}
