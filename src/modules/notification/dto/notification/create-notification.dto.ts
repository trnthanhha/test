import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateNotificationDto {
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'title',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'title',
    }),
  })
  @ApiProperty({ required: true, example: 'This is title' })
  title: string;

  @IsString({
    message: i18nValidationMessage('validation.isString', { name: 'content' }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'content',
    }),
  })
  @ApiProperty({ required: true, example: 'This is content' })
  content: string;
}
