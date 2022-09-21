import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '../redis/redis.module';
import { StandardPriceHistory } from './entities/standard-price-history.entity';
import { StandardPrice } from './entities/standard-price.entity';
import { StandardPriceController } from './standard-price.controller';
import { StandardPriceService } from './standard-price.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StandardPrice, StandardPriceHistory]),
    RedisModule,
  ],
  controllers: [StandardPriceController],
  providers: [StandardPriceService],
})
export class StandardPriceModule {}
