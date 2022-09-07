import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import {OrderBy} from "../../../../utils/db_syntax";

export enum SortByTopic {
  ID = 'id',
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class ListTopicDto {
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
  @IsEnum(SortByTopic, {
    message: i18nValidationMessage('validation.matchEnum', {
      enum: Object.values(SortByTopic).join(', '),
      field: 'sortBy',
    }),
  })
  @ApiPropertyOptional({
    description: 'Sort by field name',
    enum: SortByTopic,
    example: SortByTopic.ID,
  })
  sortBy: SortByTopic;

  @IsOptional()
  @IsEnum(OrderBy, {
    message: i18nValidationMessage('validation.matchEnum', {
      enum: Object.values(OrderBy).join(', '),
      field: 'orderBy',
    }),
  })
  @ApiPropertyOptional({
    description: 'Order by topic',
    enum: OrderBy,
    example: OrderBy.ASC,
  })
  orderBy: OrderBy;

  @ApiPropertyOptional({ description: 'Search by name' })
  name: string;
}
