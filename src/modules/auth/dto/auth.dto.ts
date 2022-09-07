import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export interface LoginResponse {
  token: string;
  refreshToken: string;
  expiredTime: number;
}

export interface ForgotPasswordResp {
  token: string;
}
export class LogoutDto {
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'fcmToken',
    }),
  })
  @ApiPropertyOptional({ example: '' })
  fcmToken: string;
}

export class LoginDto extends LogoutDto {
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
