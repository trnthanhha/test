import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateTopicDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', { name: 'Name' }),
  })
  @ApiProperty({ default: 'HELLO' })
  name: string;

  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'description',
    }),
  })
  @ApiProperty({ default: 'This is description' })
  description: string;

  @IsNumber(
    {},
    {
      each: true,
      message: i18nValidationMessage('validation.isArrayNumber', {
        name: 'userIds',
      }),
    },
  )
  @ApiProperty({ example: [1, 2, 3], default: [] })
  userIds: number[];
}
