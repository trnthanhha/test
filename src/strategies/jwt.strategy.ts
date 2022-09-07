import { UsersService } from 'src/modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    private readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_KEY'),
    });
  }

  validate(payload: any, done: (error: Error, user: any) => void): boolean {
    const { iat, exp, id } = payload;

    const timeDiff: number = exp / 1000 - iat;

    if (timeDiff <= 0) {
      throw new UnauthorizedException();
    }

    done(null, { id });
    return true;
  }
}
