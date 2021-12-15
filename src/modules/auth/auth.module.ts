import { Module } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { JwtStrategy } from 'src/modules/auth/guard/jwt/auth.jwt.strategy';
import { UserModule } from 'src/modules/user/user.module';
import { AuthController } from 'src/modules/auth/auth.controller';
import { JwtRefreshStrategy } from './guard/jwt-refresh/auth.jwt-refresh.strategy';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
    providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
    exports: [AuthService],
    controllers: [AuthController],
    imports: [UserModule, LoggerModule]
})
export class AuthModule {}
