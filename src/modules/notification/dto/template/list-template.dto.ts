import { TemplateTypes } from '@modules/notification/entities/notificationTemplate.entitiy';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderBy } from '@utils/order-by';
import { IsEnum, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export enum SortByTemplate {
  ID = 'id',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class ListTemplateDto {
  @ApiProperty({
    required: true,
    example: 1,
    description: 'Page number',
  })
  page: number;

  @ApiProperty({
    required: true,
    example: 10,
    description: 'Items per page number',
  })
  pageSize: number;

  @IsOptional()
  @IsEnum(SortByTemplate, {
    message: i18nValidationMessage('validation.matchEnum', {
      enum: Object.values(SortByTemplate).join(', '),
      field: 'sortBy',
    }),
  })
  @ApiPropertyOptional({
    description: 'Sort by field name',
    enum: SortByTemplate,
    example: SortByTemplate.ID,
  })
  sortBy: SortByTemplate;

  @IsOptional()
  @IsEnum(OrderBy, {
    message: i18nValidationMessage('validation.matchEnum', {
      enum: Object.values(OrderBy).join(', '),
      field: 'orderBy',
    }),
  })
  @ApiPropertyOptional({
    description: 'Order by template',
    enum: OrderBy,
    example: OrderBy.ASC,
  })
  orderBy: OrderBy;

  @IsOptional()
  @IsEnum(TemplateTypes, {
    message: i18nValidationMessage('validation.matchEnum', {
      enum: Object.values(TemplateTypes).join(', '),
      field: 'type',
    }),
  })
  @ApiPropertyOptional({
    description: 'Order by type',
    enum: TemplateTypes,
  })
  type: TemplateTypes;

  @ApiPropertyOptional({ description: 'Search by title' })
  title: string;
}
