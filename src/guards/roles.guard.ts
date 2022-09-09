import { User } from 'src/modules/users/entities/user.entity';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserType } from '../modules/users/users.constants';
import { JwtService } from '@nestjs/jwt';
import { decodeUserFromHeader } from '../helper/authorization';

@Injectable()
export class RolesGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = [UserType.ADMIN, UserType.CUSTOMER];
    const request = context.switchToHttp().getRequest();
    const user = decodeUserFromHeader(request.headers);
    if (!user || typeof user === 'string') {
      throw new ForbiddenException();
    }

    if (!requiredRoles.includes(user.type)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
