import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { LocationHandle } from '../location-handle/entities/location-handle.entity';
import { LocationHandleService } from '../location-handle/location-handle.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location]),
    TypeOrmModule.forFeature([LocationHandle]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService, LocationHandleService],
  exports: [LocationsService],
})
export class LocationsModule {}
