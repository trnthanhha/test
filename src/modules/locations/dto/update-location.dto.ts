import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { LocationStatus } from '../locations.contants';
import { CreateLocationDto } from './create-location.dto';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
    @ApiProperty({ name: 'status', description: 'The status of location', example: 'APPROVE' })
    status: LocationStatus;
}
