import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { LocationHandle } from '../location-handle/entities/location-handle.entity';
import { LocationHandleService } from '../location-handle/location-handle.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Location]),
    TypeOrmModule.forFeature([LocationHandle]),
  ],
  controllers: [LocationsController],
  providers: [UsersService, LocationsService, LocationHandleService],
  exports: [LocationsService],
})
export class LocationsModule {}
