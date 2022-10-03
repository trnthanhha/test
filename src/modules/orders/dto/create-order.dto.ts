import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
} from 'class-validator';
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
    example: 'ID địa điểm muốn chọn mua',
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
    example: 'ID của combo muốn mua',
  })
  package_id: number;

  @ApiProperty({
    required: true,
    example:
      'cash | point | package, tương ứng với thanh toán bằng tiền mặt (VNPay), điểm, combo',
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
    example: 'ID của combo khi chọn mua địa điểm',
  })
  user_package_id: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'owner_id',
      }),
    },
  )
  @ApiProperty({
    example: 'ID của người dc mua hộ',
  })
  owner_id: number;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'identification_number',
    }),
  })
  @ApiProperty({
    example: 'CMTND/CCCD',
  })
  identification_number: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'identification_created_from',
    }),
  })
  @ApiProperty({
    example: 'Nơi cấp',
  })
  identification_created_from: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'identification_created_at',
    }),
  })
  @ApiProperty({
    example: 'Ngày cấp',
  })
  identification_created_at: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'province',
    }),
  })
  @ApiProperty({
    example: 'Tỉnh/Thành phố',
  })
  province: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'district',
    }),
  })
  @ApiProperty({
    example: 'Quận/Huyện',
  })
  district: string;

  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'address',
    }),
  })
  @ApiProperty({
    example: 'Địa chỉ nhà',
  })
  address: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  @ApiProperty({
    example: 'Số điện thoại',
  })
  phone_number: string;
}
