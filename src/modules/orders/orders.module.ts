import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from '../locations/locations.service';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { Location } from '../locations/entities/location.entity';
import { StandardPrice } from '../standard-price/entities/standard-price.entity';
import { StandardPriceHistory } from '../standard-price/entities/standard-price-history.entity';
import { RedisModule } from '../redis/redis.module';
import { LocationHandle } from '../location-handle/entities/location-handle.entity';
import { LocationHandleService } from '../location-handle/location-handle.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { BillsService } from '../bills/bills.service';
import { Bill } from '../bills/entities/bill.entity';
import { PackageService } from '../package/package.service';
import { Package } from '../package/entities/package.entity';

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([
      User,
      Order,
      Bill,
      Location,
      LocationHandle,
      Package,
      StandardPrice,
      StandardPriceHistory,
    ]),
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    BillsService,
    UsersService,
    PackageService,
    LocationsService,
    LocationHandleService,
    StandardPriceService,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
