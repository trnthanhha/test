import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPackage } from './entities/user_package.entity';

@Injectable()
export class UserPackageService {
  constructor(
    @InjectRepository(UserPackage)
    private readonly repository: Repository<UserPackage>,
  ) {}
  findAll() {
    return `This action returns all userPackage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userPackage`;
  }
}
