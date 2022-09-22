import { Module } from '@nestjs/common';
import { UserPackageService } from './user_package.service';
import { UserPackageController } from './user_package.controller';

@Module({
  controllers: [UserPackageController],
  providers: [UserPackageService]
})
export class UserPackageModule {}
