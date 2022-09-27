import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ required: true, example: 'Tên package' })
  name: string;

  @ApiProperty({ required: true, example: 1 })
  quantity: number;

  @IsOptional()
  @ApiProperty({ example: 100 })
  promotion: number;

  @IsOptional()
  @ApiProperty({ example: 20 })
  discount: number;

  @ApiProperty({ required: true, example: 100, description: 'Giá tính bằng điểm' })
  price_usd: number;

  @ApiProperty({ required: true, example: 100, description: 'Giá tính bằng Loca' })
  price_loca: number;
}
