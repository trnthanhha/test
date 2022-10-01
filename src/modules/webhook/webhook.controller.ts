import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Logger,
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
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentLog } from '../payment_log/entities/payment_log.entity';
import {
  PaymentLogTopic,
  PaymentLogType,
} from '../payment_log/payment_log.type';
import { Repository } from 'typeorm/repository/Repository';

@ApiTags('webhook')
@Controller('webhook')
@UseInterceptors(ClassSerializerInterceptor)
export default class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private readonly WhitelistVNPayIP = {
    development: {
      'localhost:4000': true,
      '113.160.92.202': true,
    },
    production: {
      '113.52.45.78': true,
      '116.97.245.130': true,
      '42.118.107.252': true,
      '113.20.97.250': true,
      '203.171.19.146': true,
      '103.220.87.4': true,
    },
  };

  constructor(
    @Inject(RabbitMQServices.VNPay) private publisher: ClientProxy,
    private readonly billsService: BillsService,
    @InjectRepository(PaymentLog)
    private readonly paymentLogRepository: Repository<PaymentLog>,
  ) {}

  @Get('vnpay')
  async storeVNPayMessage(@Req() req) {
    const requestIP =
      req.headers?.['x-forwarded-for'] ||
      req.headers?.['x-real-ip'] ||
      req.headers?.['host'];
    const appEnv = process.env.APP_ENV;
    if (!this.WhitelistVNPayIP[appEnv][requestIP]) {
      return {
        RspCode: '99',
        Message: 'IP not whitelisted',
      };
    }
    await this.logWebhook(PaymentLogTopic.VNPAY, req, requestIP);

    let response;
    try {
      response = PaymentGatewayFactory.Build().decodeResponse(req);
    } catch (ex) {
      this.logger.error(
        `decode response failed: ${req.query}, exception: `,
        ex,
      );
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

  logWebhook(topic: PaymentLogTopic, req: any, ip: string) {
    let query = req.query || '';
    let body = req.body || req.data || '';
    if (query && typeof query === 'object') {
      try {
        query = JSON.stringify(query);
      } catch (_) {
        this.logger.error(
          'query in valid, cannot parse into string',
          req.query,
        );
      }
    }

    if (body && typeof body === 'object') {
      try {
        body = JSON.stringify(body);
      } catch (_) {
        this.logger.error(
          'body in valid, cannot parse into string',
          req.body,
          req.data,
        );
      }
    }

    return this.paymentLogRepository.save(
      Object.assign(new PaymentLog(), {
        ip,
        topic,
        body,
        query,
        type: PaymentLogType.WEBHOOK,
      } as PaymentLog),
    );
  }
}
