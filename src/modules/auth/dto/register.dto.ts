import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsPhoneOrEmail, Match } from '../auth.validator.decorator';

export class RegisterDto {
  @IsPhoneOrEmail()
  @ApiProperty({ required: true, example: '+84947754271 | customer@gmail.com' })
  username: string;

  @MaxLength(256)
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'full_name',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'full_name',
    }),
  })
  @ApiProperty({ required: true, example: 'Jane La Luaga' })
  full_name: string;

  @MinLength(8)
  @MaxLength(32)
  @IsString({
    message: i18nValidationMessage('validation.isString', { name: 'password' }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'password',
    }),
  })
  @ApiProperty({ required: true, example: '12345678' })
  password: string;

  @ApiProperty({ required: true, example: '12345678' })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Match('password')
  password_confirm: string;

  locamos_access_token: string;
}
