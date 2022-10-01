import { Module } from '@nestjs/common';
import WebhookController from './webhook.controller';
import { WebhookFactory } from '../../services/message-broker/webhook.factory';
import { RabbitMQServices } from '../../services/message-broker/webhook.types';
import { BillsService } from '../bills/bills.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from '../bills/entities/bill.entity';
import { PaymentLog } from '../payment_log/entities/payment_log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, PaymentLog])],
  controllers: [WebhookController],
  providers: [WebhookFactory.Build(RabbitMQServices.VNPay), BillsService],
})
export class WebhookModule {}
