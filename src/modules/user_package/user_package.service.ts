import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, MoreThan, Repository } from 'typeorm';
import { UserPackage } from './entities/user_package.entity';
import { UPackagePurchaseStatus } from './user_package.constants';
import { PaginationResult } from '../../utils/pagination';

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
    });
    const resp = new PaginationResult<UserPackage>();
    resp.data = list;
    resp.meta = {
      page_size: limit,
      total_page: Math.ceil(total / limit),
      total_records: total,
    };

    return resp;
  }
}
