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
import { PaymentGatewayFactory } from '../orders/vendor_adapters/payment.vendor.adapters';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('webhook')
@Controller('webhook')
@UseInterceptors(ClassSerializerInterceptor)
export default class WebhookController {
  constructor(@Inject(RabbitMQServices.VNPay) private publisher: ClientProxy) {}

  @Get('vnpay')
  async storeVNPayMessage(@Req() req) {
    const response = PaymentGatewayFactory.Build().decodeResponse(req);
    this.publisher.emit('vnpay', req.query);
    return {
      RspCode: response.status_code,
      Message: response.status_code === '00' ? 'Confirm Success' : 'Confirmed',
    };
  }
}
