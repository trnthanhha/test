import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { I18nService } from 'nestjs-i18n';
import { UpdateResult } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto, LoginResponse } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { hashPassword } from '../../utils/password';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
  ) {}

  expiredDay(day: number): number {
    return new Date().setDate(new Date().getDate() + day);
  }

  async generateToken(user: User): Promise<LoginResponse> {
    const payload = {
      id: user.id,
      type: user.type,
      username: user.username,
    };

    const token: string = this.jwtService.sign(payload, {
      expiresIn: this.expiredDay(3),
    });

    const refreshToken: string = this.jwtService.sign(payload, {
      secret: process.env.JWT_KEY_REFRESH,
      expiresIn: this.expiredDay(14),
    });

    const expiredTime: number = this.expiredDay(7);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      token,
      expiredTime,
      refreshToken,
    };
  }

  async register(
    registerDto: RegisterDto,
    lang: string,
  ): Promise<LoginResponse> {
    try {
      const user: User = await this.userService.createBySignUp(
        registerDto,
        lang,
      );

      return await this.generateToken(user);
    } catch (error) {
      throw error;
    }
  }

  async login(
    { password, username }: LoginDto,
    lang: string,
  ): Promise<LoginResponse> {
    const correctUsername: string = username.replace('+', '');
    const user: User = await this.userService.findOne(
      { username: correctUsername } as User,
      lang,
    );
    //if (!user) => Exception occurred
    const isValidPassword = user.password === hashPassword(password);
    if (!isValidPassword) {
      const message: string = await this.i18n.t('auth.password.wrong', {
        lang,
      });

      throw new BadRequestException(message);
    }

    return await this.generateToken(user);
  }

  async refresh(
    { refreshToken }: RefreshTokenDto,
    lang: string,
  ): Promise<LoginResponse> {
    try {
      const verified: { id: number; email: string; iat: number; exp: number } =
        await this.jwtService.verify(refreshToken, {
          secret: process.env.JWT_KEY_REFRESH,
        });

      const user: User = await this.userService.findOne(
        {
          id: verified.id,
          refresh_token: refreshToken,
        } as User,
        lang,
      );

      return await this.generateToken(user);
    } catch (error) {
      const message: string = await this.i18n.t('auth.refreshToken.invalid', {
        lang,
      });

      throw new NotAcceptableException(message);
    }
  }

  async resetPassword(
    { idToken, username, password }: ResetPasswordDto,
    lang: string,
  ): Promise<boolean> {
    try {
      let decode: DecodedIdToken;

      try {
        decode = await admin.auth().verifyIdToken(idToken, true);
      } catch (error) {
        const message: string = await this.i18n.t('auth.idToken.invalid', {
          lang,
        });

        throw new NotAcceptableException(message);
      }
      const correctUsername: string = username.replace('+', '');
      if (correctUsername !== decode.phone_number.replace('+', '')) {
        const message: string = await this.i18n.t('auth.idToken.invalid', {
          lang,
        });

        throw new NotAcceptableException(message);
      }

      const expireTime: number = decode.exp * 1000;
      const currentTime: number = Date.now();

      if (currentTime > expireTime) {
        const message: string = await this.i18n.t('auth.idToken.expired', {
          lang,
        });

        throw new BadRequestException(message);
      }

      const user: User = await this.userService.findOne(
        { username: correctUsername } as User,
        lang,
      );

      return await this.userService.resetPassword(user.id, password);
    } catch (error) {
      throw error;
    }
  }

  async logout(user: User): Promise<UpdateResult> {
    return await this.userService.updateRefreshToken(user.id, '');
  }
}
