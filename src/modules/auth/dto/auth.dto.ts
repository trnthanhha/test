import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiredTime: number;
}

export class LoginDto {
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'usernameOrPhone',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'usernameOrPhone',
    }),
  })
  @ApiPropertyOptional({ required: false, example: '84947754271' })
  usernameOrPhone: string;

  @IsString({
    message: i18nValidationMessage('validation.isString', { name: 'password' }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'password',
    }),
  })
  @ApiProperty({ required: true, example: '123' })
  password: string;
}
