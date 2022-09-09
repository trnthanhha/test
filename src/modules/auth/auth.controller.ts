import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { UpdateResult } from 'typeorm';
import { Auth } from 'src/decorators/roles.decorator';
import { GetAuthUser } from 'src/decorators/user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponse } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login to service' })
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @I18n() i18n: I18nContext,
  ): Promise<LoginResponse> {
    return this.authService.login(loginDto, i18n.lang);
  }

  @ApiOperation({ summary: 'Refresh token to service' })
  @Post('refreshToken')
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @I18n() i18n: I18nContext,
  ): Promise<LoginResponse> {
    return this.authService.refresh(refreshTokenDto, i18n.lang);
  }

  @ApiOperation({ summary: 'Register account' })
  @Post('register')
  register(
    @Body() registerDto: RegisterDto,
    @I18n() i18n: I18nContext,
  ): Promise<LoginResponse> {
    return this.authService.register(registerDto, i18n.lang);
  }

  @ApiOperation({ summary: 'Reset your password' })
  @Post('resetPassword')
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @I18n() i18n: I18nContext,
  ): Promise<boolean> {
    return this.authService.resetPassword(resetPasswordDto, i18n.lang);
  }

  @Auth()
  @ApiOperation({ summary: 'Logout to service' })
  @Post('logout')
  logout(@GetAuthUser() user: User): Promise<UpdateResult> {
    return this.authService.logout(user);
  }
}
