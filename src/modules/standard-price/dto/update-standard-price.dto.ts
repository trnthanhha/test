import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateStandardPriceDto {
  @ApiProperty({ name: 'price', example: 1000000 })
  @IsNotEmpty()
  price: number;
}
