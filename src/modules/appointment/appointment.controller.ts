import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Query
} from '@nestjs/common';
import { PaginationService } from 'src/pagination/pagination.service';
import { RequestValidationPipe } from 'src/request/pipe/request.validation.pipe';
import { Response } from 'src/response/response.decorator';
import { IResponse, IResponsePaging } from 'src/response/response.interface';
import { AuthJwtGuard } from '../auth/auth.decorator';
import { ENUM_PERMISSIONS } from '../permission/permission.constant';
import { AppointmentService } from './appointment.service';
import { AppointmentCreateValidation } from './validation/appointment.create.validate';
import {
    AppointmentDocument,
    IAppointmentDocument
} from './appointment.interface';
import {
    ENUM_APPOINTMENT_MESSAGE,
    ENUM_APPOINTMENT_STATUS_CODE_ERROR
} from './appointment.constant';
import { AppointmentUpdateValidation } from './validation/appointment.update.validate';
import { SendSMSService } from '../sendSMS/sendSMS.service';
import { AppointmentListValidation } from './validation/appointment.list.validate';
import { PatientService } from '../patient/patient.service';
import { PatientDocument } from '../patient/patient.interface';
import { QueryByIdValidation } from 'src/request/validation/request.query-by-id.validation';

@Controller('/appointment')
export class AppointmentController {
    constructor(
        private readonly paginationService: PaginationService,
        private readonly appointmentService: AppointmentService,
        private readonly sendSMSService: SendSMSService,
        private readonly patientService: PatientService
    ) {}

    @Response('appointment.findAll')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/list')
    async findAll(
        @Query(RequestValidationPipe)
        { page, perPage, sort, search }: AppointmentListValidation
    ): Promise<IResponsePaging> {
        const skip: number = await this.paginationService.skip(page, perPage);
        const findPatient: Record<string, any> = {};
        const findAppointment: Record<string, any> = {};
        if (search && search !== '') {
            findPatient['$or'] = [
                {
                    name: new RegExp(search)
                },
                {
                    phone: new RegExp(search)
                },
                {
                    email: new RegExp(search)
                }
            ];
            const patients: PatientDocument[] = await this.patientService.findAll(
                findPatient
            );

            findAppointment['$or'] = patients.map((patient) => {
                return {
                    patient_id: patient._id
                };
            });

            if (findAppointment['$or'].length === 0) {
                findAppointment['$or'] = [{ _id: null }];
            }
        }

        const appointment: AppointmentDocument[] = await this.appointmentService.findAll<AppointmentDocument>(
            findAppointment,
            {
                limit: perPage,
                skip: skip,
                sort,
                populate: true
            }
        );

        const totalData: number = await this.appointmentService.getTotalData(
            findAppointment
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
            data: appointment
        };
    }

    @Response('appointment.findOneById')
    @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/detail/:_id')
    async findOneById(): Promise<IResponse> {
        return;
    }

    @Response('appointment.create')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_CREATE)
    @Post('/create')
    async create(
        @Body(RequestValidationPipe) data: AppointmentCreateValidation
    ): Promise<IResponse> {
        const create = await this.appointmentService.create(data);

        const appointment: IAppointmentDocument = await this.appointmentService.findOneById<IAppointmentDocument>(
            create._id,
            {
                populate: true
            }
        );
        if (appointment.patient_id?.phone) {
            await this.sendSMSService.sendSMS(
                appointment.patient_id?.phone.toString(),
                ENUM_APPOINTMENT_MESSAGE.APPOINTMENT_CREATE
            );
        }
        return {
            _id: create._id
        };
    }

    @Response('appointment.update')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_UPDATE)
    @Put('/update/:_id')
    async update(
        @Param(RequestValidationPipe) _id: QueryByIdValidation,
        @Body(RequestValidationPipe) data: AppointmentUpdateValidation
    ): Promise<IResponse> {
        const appointment: IAppointmentDocument = await this.appointmentService.findOneById<IAppointmentDocument>(
            _id as unknown as string,
            {
                populate: true
            }
        );

        if (!appointment) {
            throw new NotFoundException({
                statusCode:
                    ENUM_APPOINTMENT_STATUS_CODE_ERROR.APPOINTMENT_NOT_FOUND_ERROR,
                message: 'appointment.error.notFound'
            });
        }

        await this.appointmentService.updateOneById(_id as unknown as string, data);
        if (appointment.patient_id?.phone) {
            await this.sendSMSService.sendSMS(
                appointment.patient_id?.phone.toString(),
                ENUM_APPOINTMENT_MESSAGE.APPOINTMENT_CREATE
            );
        }
        return {
            _id
        };
    }

    @Response('appointment.delete')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_DELETE)
    @Delete('/delete/:_id')
    async delete(@Param(RequestValidationPipe) _id: QueryByIdValidation): Promise<void> {
        const appointment: IAppointmentDocument = await this.appointmentService.findOneById<IAppointmentDocument>(
            _id as unknown as string,
            {
                populate: true
            }
        );
        if (!appointment) {
            throw new NotFoundException({
                statusCode:
                    ENUM_APPOINTMENT_STATUS_CODE_ERROR.APPOINTMENT_NOT_FOUND_ERROR,
                message: 'appointment.error.notFound'
            });
        }

        await this.appointmentService.deleteOneById(_id as unknown as string);
        if (appointment.patient_id?.phone) {
            await this.sendSMSService.sendSMS(
                appointment.patient_id?.phone.toString(),
                ENUM_APPOINTMENT_MESSAGE.APPOINTMENT_CREATE
            );
        }
        return;
    }
}
