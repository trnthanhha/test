import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RabbitMQServices } from '../../services/message-broker/webhook.types';
import { PaymentGatewayFactory } from '../orders/vendor_adapters/payment.vendor.adapters';
import { ApiTags } from '@nestjs/swagger';
import { BillsService } from '../bills/bills.service';
import { BillStatus } from '../bills/bills.constants';

@ApiTags('webhook')
@Controller('webhook')
@UseInterceptors(ClassSerializerInterceptor)
export default class WebhookController {
  constructor(
    @Inject(RabbitMQServices.VNPay) private publisher: ClientProxy,
    private readonly billsService: BillsService,
  ) {}

  @Get('vnpay')
  async storeVNPayMessage(@Req() req) {
    const response = PaymentGatewayFactory.Build().decodeResponse(req);
    if (!response.success) {
      return {
        RspCode: response.status_code,
        Message: 'Confirmed',
      };
    }
    const bill = await this.billsService.findOneByRefID(response.ref_uid);
    if (!bill) {
      return {
        RspCode: '01',
        Message: 'Order Not Found',
      };
    }
    if (response.amount !== bill.order?.price) {
      return {
        RspCode: '04',
        Message: 'Invalid amount',
      };
    }
    switch (bill.status) {
      case BillStatus.FAILED:
      case BillStatus.PAID:
        return {
          RspCode: '02',
          Message: 'Order already confirmed',
        };
    }
    this.publisher.emit('vnpay', req.query);
    return {
      RspCode: response.success ? '00' : response.status_code,
      Message: response.success ? 'Confirm Success' : 'Confirmed',
    };
  }
}
