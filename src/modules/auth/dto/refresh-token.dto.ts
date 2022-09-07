import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RefreshTokenDto {
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      name: 'refreshToken',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.isRequired', {
      name: 'refreshToken',
    }),
  })
  @ApiProperty()
  refreshToken: string;
}
