import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class SendNotificationDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', { name: 'id' }),
  })
  @IsNumber(
    {},
    { message: i18nValidationMessage('validation.isNumber', { name: 'id' }) },
  )
  @ApiProperty({ example: 1 })
  id: number;
}
