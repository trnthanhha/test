import {
    Body,
    Controller,
    Post,
    NotFoundException,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Put
} from '@nestjs/common';
import { Debugger } from 'src/debugger/debugger.decorator';
import { RequestValidationPipe } from 'src/request/pipe/request.validation.pipe';
import { Response } from 'src/response/response.decorator';
import { IResponse } from 'src/response/response.interface';
import { Logger as DebuggerService } from 'winston';
import { UserService } from '../user/user.service';
import {
    ChangePasswordValidation,
    ForgetPasswordValidation
} from './validation/forgetPassword.validate';
import { ENUM_USER_STATUS_CODE_ERROR } from '../user/user.constant';
import { ForgetPasswordService } from './forgetPassword.service';
import { ENUM_STATUS_CODE_ERROR } from 'src/error/error.constant';
import { AuthService } from '../auth/auth.service';
import { IUserDocument } from '../user/user.interface';
import { SendMailChangePassword } from '../sendMail/sendMailChangePassword.service';
import { ENUM_PERMISSIONS } from '../permission/permission.constant';
import { AuthJwtGuard, User } from '../auth/auth.decorator';
import { UserLoginTransformer } from '../user/transformer/user.login.transformer';
import { classToPlain } from 'class-transformer';
import { Helper } from 'src/helper/helper.decorator';
import { HelperService } from 'src/helper/helper.service';
import { ISendMail } from '../sendMail/senMail.interface';

@Controller('/forgetpassword')
export class ForgetPasswordController {
    constructor(
        @Debugger() private readonly debuggerService: DebuggerService,
        @Helper() private readonly helperService: HelperService,
        private readonly userService: UserService,
        private readonly forgetPassword: ForgetPasswordService,
        private readonly authService: AuthService,
        private readonly sendMailChangePassword: SendMailChangePassword
    ) {}

    @Response('user.sendMail')
    @HttpCode(HttpStatus.OK)
    @Post()
    async sendMail(
        @Body(RequestValidationPipe) data: ForgetPasswordValidation
    ): Promise<IResponse> {
        const user: IUserDocument = await this.userService.findOne<IUserDocument>(
            {
                email: data.email
            },
            { populate: true }
        );

        if (!user) {
            this.debuggerService.error('Send Mail Error', {
                class: 'ForgetPasswordController',
                function: 'sendMail'
            });

            throw new NotFoundException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_NOT_FOUND_ERROR,
                message: 'user.error.notFound'
            });
        }

        const safe: UserLoginTransformer = await this.userService.mapLogin(
            user
        );
        const payload: Record<string, any> = {
            ...classToPlain(safe)
        };

        const send: ISendMail = await this.sendMailChangePassword.sendMail(
            data.email,
            await this.authService.createAccessToken(payload, false)
        );

        if (!send.status) {
            throw new InternalServerErrorException({
                statusCode: ENUM_STATUS_CODE_ERROR.UNKNOWN_ERROR,
                message: 'http.server.internalServerError'
            });
        }

        return;
    }

    @Response('user.update')
    @AuthJwtGuard(ENUM_PERMISSIONS.PROFILE_UPDATE)
    @HttpCode(HttpStatus.OK)
    @Put()
    async changePassword(
        @Body(RequestValidationPipe) data: ChangePasswordValidation,
        @User('_id') _id: string
    ): Promise<IResponse> {
        const salt: string = await this.helperService.randomSalt();
        const passwordHash = await this.helperService.bcryptHashPassword(
            data.password,
            salt
        );
        try {
            await this.forgetPassword.updateOneById(_id, passwordHash);

            return;
        } catch (err: any) {
            this.debuggerService.error('update try catch', {
                class: 'UserController',
                function: 'update',
                error: {
                    ...err
                }
            });
            throw new InternalServerErrorException({
                statusCode: ENUM_STATUS_CODE_ERROR.UNKNOWN_ERROR,
                message: 'http.server.internalServerError'
            });
        }
    }
}
