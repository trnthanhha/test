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
import { ForgetPasswordService } from './forgetPassword.service';
import { ENUM_STATUS_CODE_ERROR } from 'src/error/error.constant';
import { AuthService } from '../auth/auth.service';
import { IUserDocument } from '../user/user.interface';
import { SendMailChangePassword } from '../sendMail/sendMailChangePassword.service';
import { AuthJwtBasicGuard, User } from '../auth/auth.decorator';
import { Helper } from 'src/helper/helper.decorator';
import { HelperService } from 'src/helper/helper.service';
import { ISendMail } from '../sendMail/senMail.interface';
import { DoctorService } from '../doctor/doctor.service';
import { IDoctorDocument } from '../doctor/doctor.interface';
import { ENUM_DOCTOR_STATUS_CODE_ERROR } from '../doctor/doctor.constant';

@Controller('/forgetpassword')
export class ForgetPasswordController {
    constructor(
        @Debugger() private readonly debuggerService: DebuggerService,
        @Helper() private readonly helperService: HelperService,
        private readonly userService: UserService,
        private readonly doctorService: DoctorService,
        private readonly forgetPassword: ForgetPasswordService,
        private readonly authService: AuthService,
        private readonly sendMailChangePassword: SendMailChangePassword
    ) {}

    @Response('doctor.sendMail')
    @HttpCode(HttpStatus.OK)
    @Post()
    async sendMail(
        @Body(RequestValidationPipe) data: ForgetPasswordValidation
    ): Promise<IResponse> {
        const doctor: IDoctorDocument = await this.doctorService.findOne<IDoctorDocument>(
            {
                email: data.email,
                exam_place: data.exam_place
            }
        );

        if (!doctor) {
            throw new NotFoundException({
                statusCode: ENUM_DOCTOR_STATUS_CODE_ERROR.DOCTOR_NOT_FOUND_ERROR,
                message: 'doctor.error.notFound'
            });
        }
        const send: ISendMail = await this.sendMailChangePassword.sendMail(
            data.email,
            await this.authService.createAccessToken(doctor, false),
            data.url
        );

        if (!send.status) {
            throw new InternalServerErrorException({
                statusCode: ENUM_STATUS_CODE_ERROR.UNKNOWN_ERROR,
                message: 'http.serverError.internalServerError'
            });
        }

        return;
    }

    @Response('doctor.update')
    @HttpCode(HttpStatus.OK)
    @AuthJwtBasicGuard()
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
        await this.forgetPassword.updateOneById(_id, passwordHash);

        return;
    }
}
