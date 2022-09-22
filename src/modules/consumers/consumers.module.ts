import { Module } from '@nestjs/common';
import { ConsumersService } from './consumers.service';
import { ConsumersController } from './consumers.controller';
import { WebhookFactory } from '../../services/message-broker/webhook.factory';
import { RabbitMQServices } from '../../services/message-broker/webhook.types';

@Module({
  controllers: [ConsumersController],
  providers: [ConsumersService, WebhookFactory.Build(RabbitMQServices.VNPay)],
})
export class ConsumersModule {}
