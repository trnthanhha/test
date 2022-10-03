import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThan, Repository } from 'typeorm';
import { UserPackage } from './entities/user_package.entity';
import { UPackagePurchaseStatus } from './user_package.constants';
import { PaginationResult } from '../../utils/pagination';
import { User } from '../users/entities/user.entity';

@Injectable()
export class UserPackageService {
  constructor(
    @InjectRepository(UserPackage)
    private readonly repository: Repository<UserPackage>,
  ) {}

  async findUsablePackages(
    where: FindOptionsWhere<UserPackage>,
    limit: number,
    page: number,
  ): Promise<PaginationResult<UserPackage>> {
    Object.assign(where, {
      remaining_quantity: MoreThan(0),
      purchase_status: UPackagePurchaseStatus.PAID,
    });
    const [list, total] = await this.repository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      relations: {
        owner: true,
        buyer: true,
      },
    });

    return new PaginationResult<UserPackage>(list, total, limit);
  }

  async getRemainingNft(user: User) {
    const rs = await this.repository
      .createQueryBuilder()
      .select('SUM(remaining_quantity) as total_remain_nft')
      .where({
        purchase_status: UPackagePurchaseStatus.PAID,
        user_id: user.id,
        remaining_quantity: MoreThan(0),
      })
      .limit(1)
      .execute();
    if (!rs?.length) {
      throw new InternalServerErrorException(
        'Get remaining quantity failed, undefined response',
      );
    }

    return { total_remain_nft: +rs[0].total_remain_nft };
  }
}
