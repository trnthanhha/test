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

  async findUsableChoices(
    limit: number,
    page: number,
    user: User,
  ): Promise<PaginationResult<UserPackage>> {
    const list = await this.repository.find({
      where: {
        remaining_quantity: MoreThan(0),
        purchase_status: UPackagePurchaseStatus.PAID,
        user_id: user.id,
      },
      order: {
        id: 'ASC',
      },
    });
    let total = 0;
    const flatten = [];
    if (list?.length) {
      list.forEach((item) => {
        total += item.remaining_quantity;
        for (let i = 1; i <= item.remaining_quantity; i++) {
          flatten.push({
            id: item.id,
            ref_id: item.ref_id,
            remaining_quantity: 1,
            package_id: item.package_id,
            package_name: item.package_name,
            price: item.price,
            price_usd: item.price_usd,
          } as UserPackage);
        }
      });
    }

    return new PaginationResult<UserPackage>(
      flatten.slice((page - 1) * limit, page * limit),
      total,
      limit,
    );
  }

  async findUsablePackages(
    where: FindOptionsWhere<UserPackage>,
    limit: number,
    page: number,
    status: string,
  ): Promise<PaginationResult<UserPackage>> {
    Object.assign(where, {
      remaining_quantity: MoreThan(0),
    });
    switch (status) {
      case 'all':
        break;
      case UPackagePurchaseStatus.PAID:
      default:
        where.purchase_status = UPackagePurchaseStatus.PAID;
    }
    const [list, total] = await this.repository.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      relations: {
        owner: true,
        buyer: true,
      },
      order: {
        id: 'ASC',
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
