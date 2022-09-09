import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsPhoneOrEmail } from '../auth.validator.decorator';

export class RegisterDto {
  @IsPhoneOrEmail()
  @ApiProperty({ required: true, example: '+84947754271 | customer@gmail.com' })
  username: string;

  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'idToken',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'idToken',
    }),
  })
  @ApiProperty({ required: true, example: '123' })
  idToken: string;

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
