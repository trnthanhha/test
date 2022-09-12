import { IsNumber, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';

export class ValidateDistanceDto {
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
}
