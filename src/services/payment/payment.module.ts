import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { OrdersService } from '../../modules/orders/orders.service';
import { BillsService } from '../../modules/bills/bills.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../modules/orders/entities/order.entity';
import { LocationsService } from '../../modules/locations/locations.service';
import { StandardPriceService } from '../../modules/standard-price/standard-price.service';
import { Bill } from '../../modules/bills/entities/bill.entity';
import { Location } from '../../modules/locations/entities/location.entity';
import { LocationHandleService } from '../../modules/location-handle/location-handle.service';
import { LocationHandle } from '../../modules/location-handle/entities/location-handle.entity';
import { StandardPrice } from '../../modules/standard-price/entities/standard-price.entity';
import { StandardPriceHistory } from '../../modules/standard-price/entities/standard-price-history.entity';
import { RedisModule } from '../../modules/redis/redis.module';
import { PackageService } from '../../modules/package/package.service';
import { Package } from '../../modules/package/entities/package.entity';

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
  controllers: [PaymentController],
  providers: [
    PaymentService,
    OrdersService,
    BillsService,
    PackageService,
    LocationsService,
    LocationHandleService,
    StandardPriceService,
  ],
})
export class PaymentModule {}
