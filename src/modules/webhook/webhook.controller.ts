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
import { PaymentTarget } from '../orders/orders.constants';
import { VNPayExtendData } from '../../services/payment/payment.types';

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
    console.log(
      'check remote address: ',
      req.headers?.['x-forwarded-for'],
      req.headers?.['X-Forwarded-For'],
      req.headers?.['X-Real-IP'],
      req.headers?.['x-real-ip'],
    );
    let response;
    try {
      response = PaymentGatewayFactory.Build().decodeResponse(req);
    } catch (_) {
      return {
        RspCode: '99',
        Message: 'Unknown error',
      };
    }
    if (!response.success) {
      return {
        RspCode: response.status_code,
        Message: 'Confirmed',
      };
    }
    if (!response.ref_uid) {
      return {
        RspCode: '99',
        Message: 'Unknown error',
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
    this.publisher.emit('vnpay', {
      raw: req.query,
      extend: {
        target:
          bill.order?.location_id > 0
            ? PaymentTarget.LOCATION
            : bill.order?.user_package_id > 0
            ? PaymentTarget.PACKAGE
            : undefined,
      } as VNPayExtendData,
    });
    return {
      RspCode: response.success ? '00' : response.status_code,
      Message: response.success ? 'Confirm Success' : 'Confirmed',
    };
  }
}
