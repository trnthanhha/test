import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { StandardPrice } from '../standard-price/entities/standard-price.entity';
import { StandardPriceHistory } from '../standard-price/entities/standard-price-history.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Package, StandardPrice, StandardPriceHistory]),
    RedisModule,
  ],
  controllers: [PackageController],
  providers: [PackageService, StandardPriceService],
})
export class PackageModule {}
