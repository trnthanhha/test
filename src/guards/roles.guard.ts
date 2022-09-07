import { User } from 'src/modules/users/entities/user.entity';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserType } from '../modules/users/users.constants';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = [UserType.ADMIN, UserType.CUSTOMER];
    const request = context.switchToHttp().getRequest();
    const bearer = request.headers?.authorization;
    if (!bearer) {
      throw new ForbiddenException();
    }
    const payload = bearer.substring('Bearer '.length);
    const user = new JwtService().decode(payload, { json: true });
    if (!user || typeof user === 'string') {
      throw new ForbiddenException();
    }

    if (!requiredRoles.includes(user.type)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
