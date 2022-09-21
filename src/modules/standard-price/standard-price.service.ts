import {
  ClassSerializerInterceptor,
  Inject,
  Injectable,
  UseInterceptors,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { IsNull, Not, Repository } from 'typeorm';
import { REDIS_CLIENT_PROVIDER } from '../redis/redis.constants';
import { generateRedisKey } from '../redis/redis.keys.pattern';
import { User } from '../users/entities/user.entity';
import { StandardPriceHistory } from './entities/standard-price-history.entity';
import { StandardPrice } from './entities/standard-price.entity';
import { STAND_PRICE_CACHE_KEY } from './standard-price.contrants';

@Injectable()
export class StandardPriceService {
  constructor(
    @InjectRepository(StandardPrice) private repo: Repository<StandardPrice>,
    @InjectRepository(StandardPriceHistory)
    private standardPriceHistory: Repository<StandardPriceHistory>,
    @Inject(REDIS_CLIENT_PROVIDER) private redis: Redis,
  ) {}

  private standardPriceCacheKey = generateRedisKey(
    StandardPriceService.name,
    STAND_PRICE_CACHE_KEY,
  );

  async updateStandPrice(price: number, currentUser: User) {
    const standardPrice = await this.repo.findOne({
      where: { id: Not(IsNull()) },
    });

    let newStandardPrice: StandardPrice;

    await this.standardPriceHistory.save({
      price_after: price,
      price_before: standardPrice ? standardPrice.price : null,
      user: currentUser,
    } as StandardPriceHistory);

    if (standardPrice) {
      standardPrice.price = price;
      newStandardPrice = await this.repo.save({
        ...standardPrice,
        user: currentUser,
      });

      await this.redis.del(this.standardPriceCacheKey);
    } else {
      newStandardPrice = await this.repo.save({
        price: price,
      } as StandardPrice);
    }

    return newStandardPrice;
  }

  async getStandardPrice() {
    const cacheStandardPrice = await this.redis.get(this.standardPriceCacheKey);

    if (cacheStandardPrice) {
      try {
        return JSON.parse(cacheStandardPrice);
      } catch (error) {
        const standardPrice = await this.repo.findOne({
          where: { id: Not(IsNull()) },
        });

        this.redis.set(
          this.standardPriceCacheKey,
          JSON.stringify(standardPrice),
        );

        return standardPrice;
      }
    }

    const standardPrice = await this.repo.findOne({
      where: { id: Not(IsNull()) },
    });

    this.redis.set(this.standardPriceCacheKey, JSON.stringify(standardPrice));

    return standardPrice;
  }

  async getStandardPriceHistory(query: { page: string; limit: string }) {
    const page = +query.page || 1;
    const limit = +query.limit || 10;

    const [standardPriceHistories, total] =
      await this.standardPriceHistory.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        relations: ['user'],
        order: { created_at: 'DESC' },
      });

    return {
      data: standardPriceHistories,
      meta: {
        page_size: limit,
        total_page: Math.ceil(total / limit),
        total_records: total,
      },
    };
  }
}
