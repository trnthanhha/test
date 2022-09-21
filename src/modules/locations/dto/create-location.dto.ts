import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateLocationDto {
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'name',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'name',
    }),
  })
  @ApiProperty({ required: true, example: 'This is name of location' })
  name: string;

  @IsUrl({
    message: i18nValidationMessage('validation.isURL', {
      name: 'map_captured',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'map_captured',
    }),
  })
  @ApiProperty({
    required: true,
    example: 'This url link to the image captured on google maps',
  })
  map_captured: string;

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

  requestedAt: Date;
}
