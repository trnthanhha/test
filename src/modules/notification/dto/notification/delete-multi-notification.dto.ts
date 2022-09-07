import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class DeleteMultiNotificationDto {
  @IsNumber(
    {},
    {
      each: true,
      message: i18nValidationMessage('validation.isArrayNumber', {
        name: 'ids',
      }),
    },
  )
  @ApiProperty({ example: [1, 2, 3], default: [] })
  ids: number[];
}
