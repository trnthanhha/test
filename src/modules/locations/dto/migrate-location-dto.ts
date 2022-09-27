import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';

export class MigrateLocationDto {
  @IsString({
    message: i18nValidationMessage('nft_name.validation.isString', {
      name: 'nft_name',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('nft_name.validation.isRequired', {
      name: 'nft_name',
    }),
  })
  @ApiProperty({ required: true, example: 'Tên địa chỉ' })
  nft_name: string;

  @IsString({
    message: i18nValidationMessage('nft_owner.validation.isString', {
      name: 'nft_owner',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('nft_owner.validation.isRequired', {
      name: 'nft_owner',
    }),
  })
  @ApiProperty({ required: true, example: 'Tên chủ sở hữu' })
  nft_owner: string;

  @IsOptional()
  @ApiProperty({
    required: true,
    example:
      'Link ảnh xem địa điểm trên map hoặc ảnh thực tế để hiện ở landing page NFT',
  })
  nft_image: string;

  @Max(180)
  @Min(-180)
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'long',
      }),
    },
  )
  @ApiProperty({ required: true, example: '105.89999534892816' })
  long: number;

  @Max(90)
  @Min(-90)
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'lat',
      }),
    },
  )
  @ApiProperty({ required: true, example: '21.02744419441864' })
  lat: number;

  @ApiProperty({ required: true, example: '24/7. FORMAT: dd/M' })
  purchase_date: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    required: true,
    example: 'Token ID của NFT',
  })
  nft_network_token_id: number;
}
