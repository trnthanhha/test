import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ required: true, example: 'Tên package' })
  name: string;

  @ApiProperty({ required: true, example: 'Tên package' })
  quantity: number;

  @IsOptional()
  @ApiProperty({ example: 'Tên package' })
  promotion: number;

  @IsOptional()
  @ApiProperty({ example: 'Tên package' })
  discount: number;
}
