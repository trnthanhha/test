import { Module } from '@nestjs/common';
import WebhookController from './webhook.controller';
import { WebhookFactory } from '../../services/message-broker/webhook.factory';
import { RabbitMQServices } from '../../services/message-broker/webhook.types';

@Module({
  controllers: [WebhookController],
  providers: [WebhookFactory.Build(RabbitMQServices.VNPay)],
})
export class WebhookModule {}
