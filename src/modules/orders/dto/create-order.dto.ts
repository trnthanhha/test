import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentType } from '../orders.constants';

export class CreateOrderDto {
  @Min(1)
  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'location_id',
      }),
    },
  )
  @ApiProperty({
    required: true,
    example: 123,
  })
  location_id: number;

  @Min(1)
  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'lat',
      }),
    },
  )
  @ApiProperty({ example: 10.1232132 })
  lat: number;

  @Min(1)
  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'long',
      }),
    },
  )
  @ApiProperty({ example: 10.1232132 })
  long: number;

  @IsOptional()
  @ApiProperty({ example: 'Khu vực BigC Thăng Long, Hà Nội' })
  name: string;

  @IsOptional()
  @ApiProperty({ example: 'https://your_location.com/image.png' })
  map_captured: string;

  @Min(1)
  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'package_id',
      }),
    },
  )
  @ApiProperty({
    required: true,
    example: 123,
  })
  package_id: number;

  @ApiProperty({
    required: true,
    example: 'cash | point | package',
  })
  @IsEnum(PaymentType, {
    message: i18nValidationMessage('validation.IsEnumPaymentType', {
      name: 'type',
    }),
  })
  type: PaymentType;

  @Min(1)
  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'user_package_id',
      }),
    },
  )
  @ApiProperty({
    required: true,
    example: 123,
  })
  user_package_id: number;
}
