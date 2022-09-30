import { Injectable } from '@nestjs/common';
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

  async getRamainingNft(user: User) {
    const userPackages = await this.repository.find({
      where: {
        user_id: user.id,
        remaining_quantity: MoreThan(0),
      },
    });

    const totalRemainingNft = userPackages
      .map((up) => up.remaining_quantity)
      .reduce((prev, curr) => prev + curr, 0);

    return { total_remain_nft: totalRemainingNft };
  }
}
