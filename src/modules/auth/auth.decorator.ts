import {
    UseGuards,
    createParamDecorator,
    ExecutionContext,
    applyDecorators,
    SetMetadata
} from '@nestjs/common';
import { IAuthApplyDecorator } from 'src/modules/auth/auth.interface';
import { PermissionDefaultGuard } from 'src/modules/permission/guard/permission.default.guard';
import {
    ENUM_PERMISSIONS,
    PERMISSION_META_KEY
} from 'src/modules/permission/permission.constant';
import { BasicGuard } from './guard/basic/auth.basic.guard';
import { AuthDefaultGuard } from './guard/default/auth.default.guard';
import { JwtRefreshGuard } from './guard/jwt-refresh/auth.jwt-refresh.guard';
import { JwtGuard } from './guard/jwt/auth.jwt.guard';

export function AuthJwtGuard(
    ...permissions: ENUM_PERMISSIONS[]
): IAuthApplyDecorator {
    return applyDecorators(
        UseGuards(JwtGuard, PermissionDefaultGuard, AuthDefaultGuard),
        SetMetadata(PERMISSION_META_KEY, permissions)
    );
}

export function AuthBasicGuard(): IAuthApplyDecorator {
    return applyDecorators(UseGuards(BasicGuard));
}

export function AuthJwtRefreshGuard(): IAuthApplyDecorator {
    return applyDecorators(UseGuards(JwtRefreshGuard));
}

export function AuthJwtBasicGuard(): IAuthApplyDecorator {
    return applyDecorators(UseGuards(JwtGuard));
}

export const User = createParamDecorator(
    (data: string, ctx: ExecutionContext): Record<string, any> => {
        const { user } = ctx.switchToHttp().getRequest();
        return data ? user[data] : user;
    }
);

export const Token = createParamDecorator(
    (data: string, ctx: ExecutionContext): string => {
        const { headers } = ctx.switchToHttp().getRequest();
        const authorization: string[] = headers.authorization.split(' ');
        return authorization[1];
    }
);
