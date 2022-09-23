import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @ApiProperty({ name: 'username', description: 'enter email or phone' })
  @IsString()
  username?: string;

  @IsOptional()
  @ApiProperty({ name: 'last_name' })
  @IsString()
  last_name: string;

  @IsOptional()
  @ApiProperty({ name: 'first_name' })
  @IsString()
  first_name: string;

  @IsOptional()
  @ApiProperty({ name: 'password' })
  password: string;
}
