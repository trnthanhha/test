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
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rolesMeta = this.reflector.get<string[]>('roles', context.getHandler());
    const requiredRoles = rolesMeta.length > 0 ? 
      rolesMeta:
      [UserType.ADMIN, UserType.CUSTOMER];

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
