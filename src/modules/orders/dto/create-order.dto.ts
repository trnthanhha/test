import { IsNumber, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @Min(1)
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber', {
        name: 'location_id',
      }),
    },
  )
  @ApiProperty({ required: true, example: 123 })
  location_id: number;
}
