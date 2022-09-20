import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateContractDto {
  @ApiProperty({ name: 'location_id', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  location_id: number;

  @ApiProperty({ name: 'buyer_id', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  buyer_id: number;

  @ApiProperty({ name: 'owner_id', example: 1 })
  owner_id: number;
}
