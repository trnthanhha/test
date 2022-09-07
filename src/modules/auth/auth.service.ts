
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
import { NotificationService } from '../notification/notification.service';
import NotificationTopic from '../notification/entities/notificationTopic.entity';
import { DeviceService } from '../device/device.service';
import { MailService } from '@modules/mail/mail.service';
import { Topics } from '../notification/notification.constant';
import { User } from '../users/entities/user.entity'
import { UsersService } from '../users/users.service';
import { checkPhoneNumber } from '../../utils/regex';
import { LoginDto, LoginResponse, LogoutDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto, CheckPhoneDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {hashPassword} from "../../utils/password";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
    private readonly deviceService: DeviceService,
  ) {}

  expiredDay(day: number): number {
    return new Date().setDate(new Date().getDate() + day);
  }

  async registerNotification(fcmToken: string, user: User): Promise<void> {
    if (fcmToken) {
      this.deviceService.create(fcmToken, user);
      this.notificationService.subcribeToTopic(fcmToken, Topics.ALL);

      const userTopics: NotificationTopic[] =
        await this.notificationService.findTopicByUser(user);

      await Promise.all(
        userTopics.map((topic: NotificationTopic) => {
          this.notificationService.subcribeToTopic(fcmToken, topic.name);
        }),
      );
    }
  }

  async generateToken(user: User): Promise<LoginResponse> {
    const payload: { id: number; email: string } = {
      id: user.id,
      email: user.email,
    };

    const token: string = this.jwtService.sign(payload);

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
    const { idToken, fcmToken } = registerDto;

    try {
      try {
        await admin.auth().verifyIdToken(idToken, true);
      } catch (error) {
        const message: string = await this.i18n.t('auth.idToken.invalid', {
          lang,
        });

        throw new NotAcceptableException(message);
      }

      const user: User = await this.userService.createBySignUp(
        registerDto,
        lang,
      );

      await this.registerNotification(fcmToken, user);

      return await this.generateToken(user);
    } catch (error) {
      throw error;
    }
  }

  async checkPhoneNumber(
    { phone }: CheckPhoneDto,
    lang: string,
  ): Promise<boolean> {
    const nPhone: string = phone.replace('+', '');
    const user: User = await this.userService.findByCondition({
      phone: nPhone,
    });
    if (user) {
      const message: string = await this.i18n.t('user.phone.existed', { lang });

      throw new BadRequestException(message);
    }

    return true;
  }

  async login(
    { password, fcmToken, usernameOrPhone }: LoginDto,
    lang: string,
  ): Promise<LoginResponse> {
    const phone: string = usernameOrPhone.replace('+', '');
    const validPhone = checkPhoneNumber(phone);
    let user: User;

    if (validPhone) {
      user = await this.userService.findByPhone(phone, lang);
    } else {
      throw new BadRequestException('invalid phone number')
    }

    const isValidPassword = user.password === hashPassword(password)

    if (!isValidPassword) {
      const message: string = await this.i18n.t('auth.password.wrong', {
        lang,
      });

      throw new BadRequestException(message);
    }

    await this.registerNotification(fcmToken, user);

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

      const user: User = await this.userService.findByRefreshToken(
        verified.id,
        refreshToken,
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
    { idToken, phone, password }: ResetPasswordDto,
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
      const nPhone: string = phone.replace('+', '');

      if (nPhone !== decode.phone_number.replace('+', '')) {
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

      const user: User = await this.userService.findByPhone(nPhone, lang);

      return await this.userService.resetPassword(user.id, password);
    } catch (error) {
      throw error;
    }
  }

  async logout({ fcmToken }: LogoutDto, user: User): Promise<UpdateResult> {
    if (fcmToken) {
      this.deviceService.remove(fcmToken, user);
      this.notificationService.unsubscribeFromTopic(fcmToken, Topics.ALL);

      const userTopics: NotificationTopic[] =
        await this.notificationService.findTopicByUser(user);

      await Promise.all(
        userTopics.map((topic: NotificationTopic) => {
          this.notificationService.unsubscribeFromTopic(fcmToken, topic.name);
        }),
      );
    }

    return await this.userService.updateRefreshToken(user.id, '');
  }
}
