import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, MoreThan, Repository } from 'typeorm';
import { UserPackage } from './entities/user_package.entity';
import { UPackagePurchaseStatus } from './user_package.constants';

@Injectable()
export class UserPackageService {
  constructor(
    @InjectRepository(UserPackage)
    private readonly repository: Repository<UserPackage>,
  ) {}

  findUsablePackages(options: FindManyOptions<UserPackage>) {
    Object.assign(options.where, {
      remaining_quantity: MoreThan(0),
      purchase_status: UPackagePurchaseStatus.PAID,
    });
    return this.repository.find(options);
  }
}
