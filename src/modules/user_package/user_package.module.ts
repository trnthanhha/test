import { Module } from '@nestjs/common';
import { UserPackageService } from './user_package.service';
import { UserPackageController } from './user_package.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPackage } from './entities/user_package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPackage])],
  controllers: [UserPackageController],
  providers: [UserPackageService],
})
export class UserPackageModule {}
