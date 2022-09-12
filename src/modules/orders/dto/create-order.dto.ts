import { IsOptional, Matches, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @IsOptional()
  @Matches(/[a-zA-Z0-9-_,]/)
  @MaxLength(255)
  note: string;
}
