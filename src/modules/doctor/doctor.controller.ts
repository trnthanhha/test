import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    Req,
    Res
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { IResponse, IResponsePaging } from 'src/response/response.interface';

import { Response } from 'src/response/response.decorator';
import { ENUM_PERMISSIONS } from '../permission/permission.constant';
import { AuthJwtBasicGuard, AuthJwtGuard, User } from '../auth/auth.decorator';
import { RequestValidationPipe } from 'src/request/pipe/request.validation.pipe';
import { DoctorListValidation } from './validation/doctor.list.validation';
import { PaginationService } from 'src/pagination/pagination.service';
import { SendSMSService } from '../sendSMS/sendSMS.service';
import { DoctorDocument, IDoctorUpdate } from './doctor.interface';
import { ENUM_DOCTOR_STATUS_CODE_ERROR } from './doctor.constant';
import { DoctorUpdateActiveAndUnActiveValidation } from './validation/doctor.updateActiveAndUnActive.validation';
import { SendMailActiveAndUnActiveUser } from '../sendMail/sendMailActiveAndUnActiveUser.service';
import { Helper } from 'src/helper/helper.decorator';
import { HelperService } from 'src/helper/helper.service';
import { DoctorUpdateProfileValidation } from './validation/doctor.updateProfile.validation';
import { IErrors } from 'src/error/error.interface';
import { SendMailChangeEmail } from '../sendMail/sendMailChangeEmail.service';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { QueryByIdValidation } from 'src/request/validation/request.query-by-id.validation';
@Controller('/doctor')
export class DoctorController {
    constructor(
        @Helper() private readonly helperService: HelperService,
        private readonly doctorService: DoctorService,
        private readonly paginationService: PaginationService,
        private readonly sendMailActiveAndUnActiveUser: SendMailActiveAndUnActiveUser,
        private readonly sendMailChangeEmail: SendMailChangeEmail,
        // private readonly authService: AuthService,
    ) {}

    @Response('doctor.findAll')
    @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/list')
    async findAll(
        @Query(RequestValidationPipe)
        { page, perPage, sort, search }: DoctorListValidation
    ): Promise<IResponsePaging> {
        const skip: number = await this.paginationService.skip(page, perPage);
        const findDoctor: Record<string, any> = {};
        if (search && search !== '') {
            findDoctor['$or'] = [
                {
                    name: new RegExp(search)
                },
                {
                    email: new RegExp(search)
                }
            ];
        }

        const doctor: DoctorDocument[] = await this.doctorService.findAll<DoctorDocument>(
            findDoctor,
            {
                limit: perPage,
                skip: skip,
                sort,
                populate: true
            }
        );

        const totalData: number = await this.doctorService.getTotalData(
            findDoctor
        );
        const totalPage: number = await this.paginationService.totalPage(
            totalData,
            perPage
        );

        return {
            totalData,
            totalPage,
            currentPage: page,
            perPage,
            data: doctor
        };
    }

    @Response('doctor.update')
    @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_UPDATE)
    @Put('/updatestatus/:_id')
    async updateStatus(
        @Param(RequestValidationPipe) _id: QueryByIdValidation,
        @Body(RequestValidationPipe)
        data: DoctorUpdateActiveAndUnActiveValidation
    ): Promise<IResponse> {
        const doctor: DoctorDocument = await this.doctorService.findOne({
            _id
        });

        if (!doctor) {
            throw new NotFoundException({
                statusCode:
                    ENUM_DOCTOR_STATUS_CODE_ERROR.DOCTOR_NOT_FOUND_ERROR,
                message: 'doctor.error.notFound'
            });
        }

        this.sendMailActiveAndUnActiveUser.sendMail(doctor.email, data.conten);

        await this.doctorService.updateOneById(_id as unknown as string, data);
        return {
            _id
        };
    }

    @Response('doctor.update')
    @AuthJwtBasicGuard()
    @Put('/updateprofile')
    async update(
        @User() payload: Record<string, any>,
        @Body(RequestValidationPipe)
        data: DoctorUpdateProfileValidation,
        @Req() request: Request
    ): Promise<IResponse> {
        const { password } = data;
        const { _id } = payload;
        if (password) {
            const salt: string = await this.helperService.randomSalt();
            const passwordHash = await this.helperService.bcryptHashPassword(
                password,
                salt
            );
            await this.doctorService.updateOneById(_id, {
                password: passwordHash
            } as IDoctorUpdate);
            return {
                _id
            };
        }

        if (data.email && data.email !== payload.email) {
            const errors: IErrors[] = await this.doctorService.checkExist(
                data.email
            );

            if (errors.length > 0) {
                throw new BadRequestException({
                    statusCode:
                        ENUM_DOCTOR_STATUS_CODE_ERROR.DOCTOR_EXIST_ERROR,
                    message: 'doctor.error.createError',
                    errors
                });
            }

            // await this.sendMailChangeEmail.sendMail(
            //     data.email,
            //     token,
            //     data.url
            // );
            // return;
        }

        await this.doctorService.updateOneById(
            _id,
            (data as unknown) as IDoctorUpdate
        );
        
        return this.doctorService.findOne({
            _id
        });
    }
}
