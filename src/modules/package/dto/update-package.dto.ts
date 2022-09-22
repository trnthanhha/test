import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePackageDto } from './create-package.dto';
import { IsNumber, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {
  @ApiProperty({ required: true, example: 'Tên package' })
  name: string;

  @ApiProperty({ required: true, example: 'Tên package' })
  quantity: number;

  @ApiProperty({ required: true })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'version',
      }),
    },
  )
  version: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'promotion',
      }),
    },
  )
  @ApiProperty({ example: '20 (%)' })
  promotion: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'discount',
      }),
    },
  )
  @ApiProperty({ example: '256 ($)' })
  discount: number;
}
