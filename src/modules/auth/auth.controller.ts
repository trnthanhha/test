import {
    Controller,
    Post,
    Body,
    HttpStatus,
    HttpCode,
    NotFoundException,
    BadRequestException,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserService } from 'src/modules/user/user.service';
import { IUserDocument } from 'src/modules/user/user.interface';
import { Logger as DebuggerService } from 'winston';
import { Debugger } from 'src/debugger/debugger.decorator';
import { classToPlain } from 'class-transformer';
import { RequestValidationPipe } from 'src/request/pipe/request.validation.pipe';
import { AuthLoginValidation } from './validation/auth.login.validation';
import { LoggerService } from 'src/logger/logger.service';
import {
    AuthJwtBasicGuard,
    AuthJwtRefreshGuard,
    Token,
    User
} from './auth.decorator';
import { Response } from 'src/response/response.decorator';
import { IResponse } from 'src/response/response.interface';
import { UserLoginTransformer } from 'src/modules/user/transformer/user.login.transformer';
import {
    ENUM_AUTH_STATUS_CODE_ERROR,
    ENUM_AUTH_STATUS_CODE_SUCCESS
} from './auth.constant';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/user.constant';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/role.constant';
import { DoctorCreateValidation } from '../doctor/validation/doctor.create.validation';
import { IErrors } from 'src/error/error.interface';
import { DoctorService } from '../doctor/doctor.service';
import { ENUM_DOCTOR_STATUS_CODE_ERROR } from '../doctor/doctor.constant';
import { IDoctorDocument } from '../doctor/doctor.interface';

@Controller('/auth')
export class AuthController {
    constructor(
        @Debugger() private readonly debuggerService: DebuggerService,
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly doctorService: DoctorService,
        private readonly loggerService: LoggerService
    ) {}

    @Response('auth.login', ENUM_AUTH_STATUS_CODE_SUCCESS.AUTH_LOGIN_SUCCESS)
    @HttpCode(HttpStatus.OK)
    @Post('/login')
    async login(
        @Body(RequestValidationPipe) data: AuthLoginValidation
    ): Promise<IResponse> {
        const rememberMe: boolean = data.rememberMe ? true : false;
        const user: IUserDocument = await this.userService.findOne<IUserDocument>(
            {
                email: data.email
            },
            { populate: true }
        );

        if (!user) {
            const doctor: IDoctorDocument = await this.doctorService.findOne<IDoctorDocument>(
                {
                    email: data.email,
                    exam_place: data.exam_place
                }
            );

            if (!doctor) {
                throw new NotFoundException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_USER_NOT_FOUND_ERROR,
                    message: 'auth.error.userNotFound'
                });
            } else if (!doctor.isActive) {
                throw new UnauthorizedException({
                    statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_IS_INACTIVE,
                    message: 'http.clientError.unauthorized'
                });
            }

            const validate: boolean = await this.authService.validateUser(
                data.password,
                doctor.password
            );

            if (!validate) {
                throw new BadRequestException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_PASSWORD_NOT_MATCH_ERROR,
                    message: 'auth.error.passwordNotMatch'
                });
            }

            const accessToken: string = await this.authService.createAccessToken(
                doctor,
                rememberMe
            );

            const refreshToken: string = await this.authService.createRefreshToken(
                doctor,
                rememberMe
            );

            await this.authService.createRefreshTokenBD({
                id_user: doctor._id,
                refresh_token: refreshToken
            });

            delete doctor.password;

            return {
                accessToken,
                refreshToken,
                user: doctor
            };
        } else if (!user.isActive) {
            throw new UnauthorizedException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_IS_INACTIVE,
                message: 'http.clientError.unauthorized'
            });
        } else if (!user.role || (user.role && !user.role.isActive)) {
            throw new ForbiddenException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_IS_INACTIVE,
                message: 'http.clientError.forbidden'
            });
        }

        const validate: boolean = await this.authService.validateUser(
            data.password,
            user.password
        );

        if (!validate) {
            throw new BadRequestException({
                statusCode:
                    ENUM_AUTH_STATUS_CODE_ERROR.AUTH_PASSWORD_NOT_MATCH_ERROR,
                message: 'auth.error.passwordNotMatch'
            });
        }

        const safe: UserLoginTransformer = await this.userService.mapLogin(
            user
        );
        const payload: Record<string, any> = {
            ...classToPlain(safe),
            rememberMe
        };
        const accessToken: string = await this.authService.createAccessToken(
            payload,
            rememberMe
        );

        const refreshToken: string = await this.authService.createRefreshToken(
            payload,
            rememberMe
        );

        await this.authService.createRefreshTokenBD({
            id_user: user._id,
            refresh_token: refreshToken
        });

        delete user.password;
        delete user.role;

        return {
            accessToken,
            refreshToken,
            user
        };
    }

    @Response('auth.refresh')
    @AuthJwtRefreshGuard()
    @HttpCode(HttpStatus.OK)
    @Post('/refresh')
    async refresh(
        @User() payload: Record<string, any>,
        @Token() token: string
    ): Promise<IResponse> {
        const { _id, rememberMe } = payload;
        const user: IUserDocument = await this.userService.findOneById<IUserDocument>(
            _id,
            { populate: true }
        );

        if (!user) {
            const doctor: IDoctorDocument = await this.doctorService.findOne<IDoctorDocument>(
                { _id }
            );

            if (!doctor) {
                throw new NotFoundException({
                    statusCode:
                        ENUM_AUTH_STATUS_CODE_ERROR.AUTH_USER_NOT_FOUND_ERROR,
                    message: 'auth.error.userNotFound'
                });
            } else if (!doctor.isActive) {
                throw new UnauthorizedException({
                    statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_IS_INACTIVE,
                    message: 'http.clientError.unauthorized'
                });
            }

            const checkRefreshTokenExit = await this.authService.checkRefeshTokenExit(
                token
            );

            if (!checkRefreshTokenExit) {
                throw new UnauthorizedException({
                    statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_IS_INACTIVE,
                    message: 'http.clientError.unauthorized'
                });
            }

            const accessToken: string = await this.authService.createAccessToken(
                doctor,
                rememberMe
            );

            const refreshToken: string = await this.authService.createRefreshToken(
                doctor,
                rememberMe
            );

            await this.authService.createRefreshTokenBD({
                id_user: doctor._id,
                refresh_token: refreshToken
            });

            delete doctor.password;

            return {
                accessToken,
                refreshToken,
                user: doctor
            };
        } else if (!user.isActive) {
            throw new UnauthorizedException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_IS_INACTIVE,
                message: 'http.clientError.unauthorized'
            });
        } else if (!user.role || (user.role && !user.role.isActive)) {
            throw new ForbiddenException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.ROLE_IS_INACTIVE,
                message: 'http.clientError.forbidden'
            });
        }

        const safe: UserLoginTransformer = await this.userService.mapLogin(
            user
        );
        const newPayload: Record<string, any> = {
            ...classToPlain(safe),
            rememberMe
        };

        const accessToken: string = await this.authService.createAccessToken(
            newPayload,
            rememberMe
        );

        const refreshToken: string = await this.authService.createRefreshToken(
            newPayload,
            rememberMe
        );

        await this.authService.createRefreshTokenBD({
            id_user: user._id,
            refresh_token: refreshToken
        });

        return {
            accessToken,
            refreshToken
        };
    }

    @Response('auth.register')
    @Post('/register')
    async register(
        @Body(RequestValidationPipe) data: DoctorCreateValidation
    ): Promise<IResponse> {
        const errors: IErrors[] = await this.doctorService.checkExist(
            data.email
        );

        if (errors.length > 0) {
            throw new BadRequestException({
                statusCode: ENUM_DOCTOR_STATUS_CODE_ERROR.DOCTOR_EXIST_ERROR,
                message: 'doctor.error.createError',
                errors
            });
        }

        const create = await this.doctorService.create(data);

        return {
            _id: create._id
        };
    }

    @Response('auth.logout')
    @HttpCode(HttpStatus.OK)
    @AuthJwtBasicGuard()
    @Post('/logout')
    async logout(@User() payload: Record<string, any>): Promise<IResponse> {
        const { _id } = payload;
        await this.authService.deleteRefreshTokenDB(_id);
        return;
    }
}
