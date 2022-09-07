import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  ValidateIf,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RegisterDto {
  @IsPhoneNumber('VN', {
    message: i18nValidationMessage('validation.phone.notValid'),
  })
  @ApiProperty({ required: true, example: '+84947754271' })
  phone: string;

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

  @IsString({
    message: i18nValidationMessage('validation.isString', { name: 'fullName' }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'fullName',
    }),
  })

  @ValidateIf((_, value: string) => !!value)
  @IsDateString(
    {},
    {
      message: i18nValidationMessage('validation.isDateString', {
        name: 'dateOfBirth',
      }),
    },
  )

  @ValidateIf((_, value: string) => !!value)
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'fcmToken',
    }),
  })
  @ApiPropertyOptional({ example: '' })
  fcmToken: string;
}

export class CheckPhoneDto {
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'phone',
    }),
  })
  @IsPhoneNumber('VN', {
    message: i18nValidationMessage('validation.phone.notValid'),
  })
  @ApiProperty({ required: true, example: '+84947754271' })
  phone: string;
}
