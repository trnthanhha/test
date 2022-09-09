import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ResetPasswordDto {
  @IsPhoneNumber('VN', {
    message: i18nValidationMessage('validation.phone.notValid'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'username',
    }),
  })
  @ApiProperty({ required: true, example: '+84947754271' })
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
  @ApiProperty()
  idToken: string;

  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'password',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'password',
    }),
  })
  @ApiProperty({ required: true, example: '123' })
  password: string;
}
