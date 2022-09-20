import { Inject, Injectable } from '@nestjs/common';
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
      newStandardPrice = await this.repo.save(standardPrice);

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
      return JSON.parse(cacheStandardPrice);
    }

    const standardPrice = await this.repo.findOne({
      where: { id: Not(IsNull()) },
      order: { created_at: 'DESC' },
    });

    this.redis.set(this.standardPriceCacheKey, JSON.stringify(standardPrice));
    return standardPrice;
  }

  async getStandardPriceHistory(query: { page: string; limit: string }) {
    const page = +query.page || 1;
    const limit = +query.limit || 10;

    return await this.standardPriceHistory.find({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
      select: {
        id: true,
        price_after: true,
        price_before: true,
        user: {
          type: true,
          last_name: true,
          first_name: true,
        },
        created_at: true,
      },
      order: { created_at: 'DESC' },
    });
  }
}
