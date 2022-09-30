import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @ApiProperty({ name: 'username', description: 'enter email or phone' })
  @IsString()
  username?: string;

  @ApiProperty({ name: 'full_name' })
  @IsString()
  full_name: string;

  @IsOptional()
  @ApiProperty({ name: 'password' })
  password: string;
}
