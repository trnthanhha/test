import { Module } from '@nestjs/common';
import { ConsumersService } from './consumers.service';
import { ConsumersController } from './consumers.controller';
import { WebhookFactory } from '../../services/message-broker/webhook.factory';
import { RabbitMQServices } from '../../services/message-broker/webhook.types';
import { PaymentService } from '../../services/payment/payment.service';
import { OrdersService } from '../orders/orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { LocationsService } from '../locations/locations.service';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { BillsService } from '../bills/bills.service';
import { Bill } from '../bills/entities/bill.entity';
import { Location } from '../locations/entities/location.entity';
import { LocationHandleService } from '../location-handle/location-handle.service';
import { LocationHandle } from '../location-handle/entities/location-handle.entity';
import { StandardPrice } from '../standard-price/entities/standard-price.entity';
import { StandardPriceHistory } from '../standard-price/entities/standard-price-history.entity';
import { RedisModule } from '../redis/redis.module';
import { PackageService } from '../package/package.service';
import { Package } from '../package/entities/package.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Bill,
      Location,
      LocationHandle,
      Package,
      StandardPrice,
      StandardPriceHistory,
    ]),
    RedisModule,
  ],
  controllers: [ConsumersController],
  providers: [
    ConsumersService,
    OrdersService,
    BillsService,
    PaymentService,
    PackageService,
    LocationsService,
    LocationHandleService,
    StandardPriceService,
    WebhookFactory.Build(RabbitMQServices.VNPay),
  ],
})
export class ConsumersModule {}
