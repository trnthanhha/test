import { IsNumber, IsOptional, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLocationDto {
  @Min(1)
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'long',
      }),
    },
  )
  @IsOptional()
  @ApiProperty()
  id: number;

  @IsOptional()
  @ApiProperty({ example: 'slug path của địa chỉ trên landing page' })
  handle: string;

  @IsOptional()
  @ApiProperty({ example: 'Tên chủ sở hữu' })
  nft_owner: string;

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
  @IsOptional()
  @ApiProperty({ example: '105.89999534892816' })
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
  @IsOptional()
  @ApiProperty({ example: '21.02744419441864' })
  lat: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 'Token ID của NFT',
  })
  nft_network_token_id: number;
}
