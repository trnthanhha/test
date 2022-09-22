import { Injectable } from '@nestjs/common';
import { CreateUserPackageDto } from './dto/create-user_package.dto';
import { UpdateUserPackageDto } from './dto/update-user_package.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPackage } from './entities/user_package.entity';

@Injectable()
export class UserPackageService {
  constructor(
    @InjectRepository(UserPackage)
    private readonly repository: Repository<UserPackage>,
  ) {}

  create(createUserPackageDto: CreateUserPackageDto) {
    return 'This action adds a new userPackage';
  }

  findAll() {
    return `This action returns all userPackage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userPackage`;
  }

  update(id: number, updateUserPackageDto: UpdateUserPackageDto) {
    return `This action updates a #${id} userPackage`;
  }

  remove(id: number) {
    return `This action removes a #${id} userPackage`;
  }
}
