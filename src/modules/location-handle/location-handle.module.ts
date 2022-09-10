import { Module } from '@nestjs/common';
import { LocationHandleService } from './location-handle.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationHandle } from './entities/location-handle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocationHandle])],
  providers: [LocationHandleService],
  exports: [LocationHandleService],
})
export class LocationHandleModule {}
