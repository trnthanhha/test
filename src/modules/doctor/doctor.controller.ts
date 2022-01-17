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
    Query
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { IResponse, IResponsePaging } from 'src/response/response.interface';

import { Response } from 'src/response/response.decorator';
import { ENUM_PERMISSIONS } from '../permission/permission.constant';
import { AuthJwtGuard } from '../auth/auth.decorator';
import { RequestValidationPipe } from 'src/request/pipe/request.validation.pipe';
import { DoctorListValidation } from './validation/doctor.list.validation';
import { PaginationService } from 'src/pagination/pagination.service';
import { SendSMSService } from '../sendSMS/sendSMS.service';
import { DoctorDocument } from './doctor.interface';
import { ENUM_DOCTOR_STATUS_CODE_ERROR } from './doctor.constant';
import { DoctorUpdateActiveAndUnActiveValidation } from './validation/doctor.updateActiveAndUnActive.validation';
import { SendMailActiveAndUnActiveUser } from '../sendMail/sendMailActiveAndUnActiveUser.service';

@Controller('/doctor')
export class DoctorController {
    constructor(
        private readonly doctorService: DoctorService,
        private readonly paginationService: PaginationService,
        private readonly sendMailActiveAndUnActiveUser: SendMailActiveAndUnActiveUser
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
        @Param('_id') _id: string,
        @Body(RequestValidationPipe) data: DoctorUpdateActiveAndUnActiveValidation
    ): Promise<IResponse> {
        const doctor: DoctorDocument = await this.doctorService.findOne(
            { _id }
        );

        if (!doctor) {
            throw new NotFoundException({
                statusCode:
                    ENUM_DOCTOR_STATUS_CODE_ERROR.DOCTOR_NOT_FOUND_ERROR,
                message: 'doctor.error.notFound'
            });
        }

        this.sendMailActiveAndUnActiveUser.sendMail(
            doctor.email,
            data.conten
        );
        
        await this.doctorService.updateOneById(_id, data);
        return {
            _id
        };
    }
}
