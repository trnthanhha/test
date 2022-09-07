import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderBy } from '@utils/order-by';
import { IsEnum, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export enum SortByNotification {
  ID = 'id',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class ListNotificationDto {
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
  @IsEnum(SortByNotification, {
    message: i18nValidationMessage('validation.matchEnum', {
      enum: Object.values(SortByNotification).join(', '),
      field: 'sortBy',
    }),
  })
  @ApiPropertyOptional({
    description: 'Sort by field name',
    enum: SortByNotification,
    example: SortByNotification.ID,
  })
  sortBy: SortByNotification;

  @IsOptional()
  @IsEnum(OrderBy, {
    message: i18nValidationMessage('validation.matchEnum', {
      enum: Object.values(OrderBy).join(', '),
      field: 'orderBy',
    }),
  })
  @ApiPropertyOptional({
    description: 'Order by notice',
    enum: OrderBy,
    example: OrderBy.ASC,
  })
  orderBy: OrderBy;
}
