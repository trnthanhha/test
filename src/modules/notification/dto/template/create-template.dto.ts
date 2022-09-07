import { TemplateTypes } from '@modules/notification/entities/notificationTemplate.entitiy';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateNoticeTemplateDto {
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

  @IsEnum(TemplateTypes, {
    message: i18nValidationMessage('validation.matchEnum', {
      enum: Object.values(TemplateTypes).join(', '),
      field: 'type',
    }),
  })
  @ApiProperty({
    example: TemplateTypes.TOPIC,
    enum: TemplateTypes,
  })
  type: TemplateTypes;

  @ValidateIf((_) => _?.type === TemplateTypes.USER)
  @IsNumber(
    {},
    {
      each: true,
      message: i18nValidationMessage('validation.isArrayNumber', {
        name: 'userIds',
      }),
    },
  )
  @ApiPropertyOptional({ example: [1, 2, 3], default: [] })
  userIds: number[];

  @ValidateIf((_) => _?.type === TemplateTypes.TOPIC)
  @IsNumber(
    {},
    {
      each: true,
      message: i18nValidationMessage('validation.isArrayNumber', {
        name: 'topicIds',
      }),
    },
  )
  @ApiPropertyOptional({ example: [1, 2, 3], default: [] })
  topicIds: number[];
}
