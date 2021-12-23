import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Logger,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    Req
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { PaginationService } from 'src/pagination/pagination.service';
import { IResponse, IResponsePaging } from 'src/response/response.interface';
import { Logger as DebuggerService } from 'winston';
import { Debugger } from 'src/debugger/debugger.decorator';
import { Response } from 'src/response/response.decorator';
import { ENUM_PERMISSIONS } from '../permission/permission.constant';
import { RequestValidationPipe } from 'src/request/pipe/request.validation.pipe';
import { IErrors } from 'src/error/error.interface';
import { ENUM_USER_STATUS_CODE_ERROR } from '../user/user.constant';
import { PatientCreateValidation } from './validation/patient.create.validation';
import { AuthJwtGuard } from '../auth/auth.decorator';
import { ENUM_STATUS_CODE_ERROR } from 'src/error/error.constant';
import { ENUM_PATIENT_STATUS_CODE_ERROR } from './patient.constant';
import { PatientCheckExitValidation } from './validation/patient.checkExit.validation';
import { IPatientUpdate } from './patient.interface';
import { PatientUpdateValidation } from './validation/patient.update.validation';
import { Request } from 'express'

@Controller('/patient')
export class PatientController {
    constructor(
        @Debugger() private readonly debuggerService: DebuggerService,
        private readonly paginationService: PaginationService,
        private readonly patientService: PatientService
    ) {}

    @Response('patient.findPatient')
     // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get(':_id')
    async getPatient(@Req() request: Request ): Promise<IResponse>{
        try {
            const { _id } = request.params;
            const patient = await this.patientService.findPatientById(_id);
           if(patient){
               return patient;
           }else{
            throw new BadRequestException({
                statusCode: ENUM_PATIENT_STATUS_CODE_ERROR.PATIENT_NOT_FOUND_ERROR,
                message: 'patient.error.getNotFound',
            });
           }
        } catch (err: any) {
            Logger.log("err:",err)
            throw new InternalServerErrorException({
                statusCode: ENUM_STATUS_CODE_ERROR.UNKNOWN_ERROR,
                message: 'http.serverError.internalServerError',
                error: err
            });
        }
    }

    @Response('patient.checkExit')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @HttpCode(HttpStatus.OK)
    @Post('/findprofile')
    async profile(
        @Body(RequestValidationPipe)
        data: PatientCheckExitValidation
    ): Promise<IResponse> {
        const patient = await this.patientService.findPatient(data);
        if (!patient) {
            throw new NotFoundException({
                statusCode: ENUM_PATIENT_STATUS_CODE_ERROR.PATIENT_NOT_FOUND_ERROR,
                message: 'patient.error.notFound'
            });
        }
        return patient;
    }

    @Response('patient.create')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_CREATE)
    @Post('/create')
    async create(
        @Body(RequestValidationPipe)
        data: PatientCreateValidation
    ): Promise<IResponse> {
        const errors: IErrors[] = await this.patientService.checkExist(
            data.phone
        );

        if (errors.length > 0) {
            throw new BadRequestException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USER_EXISTS_ERROR,
                message: 'patient.error.createError',
                errors
            });
        }

        try {
            const create = await this.patientService.create(data);

            return {
                _id: create._id
            };
        } catch (err: any) {
            Logger.log("err:",err)
            throw new InternalServerErrorException({
                statusCode: ENUM_STATUS_CODE_ERROR.UNKNOWN_ERROR,
                message: 'http.serverError.internalServerError'
            });
        }
    }

    @Response('patient.update')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_CREATE)
    @Put('/update/:_id')
    async update(
        @Param('_id') _id: string,
        @Body(RequestValidationPipe)
        data: PatientUpdateValidation
    ){
        const errors: IErrors[] = await this.patientService.checkExistById(
            _id
        );
        if(errors.length > 0){
            throw new BadRequestException({
                statusCode: ENUM_PATIENT_STATUS_CODE_ERROR.PATIENT_NOT_FOUND_ERROR,
                message: 'patient.error.updateError',
                errors
            });
        }

        try {
            await this.patientService.updatePatientById(_id, data);
            return {
                _id
            };
        } catch (error) {
            throw new InternalServerErrorException({
                statusCode: ENUM_STATUS_CODE_ERROR.UNKNOWN_ERROR,
                message: 'http.serverError.internalServerError'
            });
        }
    }
}
