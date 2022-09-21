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

@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([Order]),
    TypeOrmModule.forFeature([Location]),
    TypeOrmModule.forFeature([StandardPrice]),
    TypeOrmModule.forFeature([StandardPriceHistory]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, LocationsService, StandardPriceService],
  exports: [OrdersService],
})
export class OrdersModule {}
