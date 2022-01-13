import {
    PipeTransform,
    ArgumentMetadata,
    UnprocessableEntityException
} from '@nestjs/common';
import { validate } from 'class-validator';
import { Debugger } from 'src/debugger/debugger.decorator';
import { Logger as DebuggerService } from 'winston';
import { Message } from 'src/message/message.decorator';
import { MessageService } from 'src/message/message.service';
import { UserUpdateValidation } from 'src/modules/user/validation/user.update.validation';
import { UserCreateValidation } from 'src/modules/user/validation/user.create.validation';
import { plainToClass } from 'class-transformer';
import { AuthLoginValidation } from 'src/modules/auth/validation/auth.login.validation';
import { IErrors } from 'src/error/error.interface';
import { ENUM_REQUEST_STATUS_CODE_ERROR } from '../request.constant';
import { PermissionListValidation } from 'src/modules/permission/validation/permission.list.validation';
import { RoleListValidation } from 'src/modules/role/validation/role.list.validation';
import { UserListValidation } from 'src/modules/user/validation/user.list.validation';
import { ChangePasswordValidation, ForgetPasswordValidation } from 'src/modules/forgetPassword/validation/forgetPassword.validate';
import { AppointmentCreateValidation } from 'src/modules/appointment/validation/appointment.create.validate';
import { AppointmentUpdateValidation } from 'src/modules/appointment/validation/appointment.update.validate';
import { PatientCreateValidation } from 'src/modules/patient/validation/patient.create.validation';
import { PatientCheckExitValidation } from 'src/modules/patient/validation/patient.checkExit.validation';
import { ExamRecordCreateValidation } from 'src/modules/examRecord/validation/examRecord.create';
import { DoctorCreateValidation } from 'src/modules/doctor/validation/doctor.create.validation';
import { AppointmentListValidation } from 'src/modules/appointment/validation/appointment.list.validate';
import { CreateMedicalHistoryDto } from 'src/modules/medical-history/validation/create-medical-history.validation';
import { ExamplaceCreateValidation } from 'src/modules/examplace/validation/examplace.create.validation';
import { ExamplaceUpdateValidation } from 'src/modules/examplace/validation/examplace.update.validation';
import { TypeBaseUpdateValidation } from 'src/modules/typebase/validation/typebase.update.validation';
import { TypeBaseCreateValidation } from 'src/modules/typebase/validation/typebase.create.validation';
import { DepartmentCreateValidation } from 'src/modules/department/validation/department.create.validation';
import { DepartmentUpdateValidation } from 'src/modules/department/validation/department.update.validation';
import { EducationCreateValidation } from 'src/modules/education/validation/education.create.validation';
import { EducationUpdateValidation } from 'src/modules/education/validation/education.update.validation';
import { PointLadderCreateValidation } from 'src/modules/pointladder/validation/pointladder.create.validate';

export class RequestValidationPipe implements PipeTransform {
    constructor(
        @Message() private readonly messageService: MessageService,
        @Debugger() private readonly debuggerService: DebuggerService
    ) {}

    async transform(
        value: Record<string, any>,
        { metatype }: ArgumentMetadata
    ): Promise<Record<string, any>> {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }

        const classTransformer = new metatype(value);
        const request = plainToClass(metatype, {
            ...classTransformer,
            ...value
        });
        this.debuggerService.info('Request Data', {
            class: 'RequestValidationPipe',
            function: 'transform',
            request: request
        });

        const rawErrors: Record<string, any>[] = await validate(request);
        if (rawErrors.length > 0) {
            const errors: IErrors[] = this.messageService.getRequestErrorsMessage(
                rawErrors
            );

            this.debuggerService.error('Request Errors', {
                class: 'RequestValidationPipe',
                function: 'transform',
                errors
            });

            throw new UnprocessableEntityException({
                statusCode:
                    ENUM_REQUEST_STATUS_CODE_ERROR.REQUEST_VALIDATION_ERROR,
                message: 'http.clientError.unprocessableEntity',
                errors
            });
        }
        return request;
    }

    private toValidate(metatype: Record<string, any>): boolean {
        const types: Record<string, any>[] = [
            UserUpdateValidation,
            UserCreateValidation,
            AuthLoginValidation,
            PermissionListValidation,
            RoleListValidation,
            UserListValidation,
            ForgetPasswordValidation,
            ChangePasswordValidation,
            AppointmentCreateValidation,
            AppointmentUpdateValidation,
            PatientCreateValidation,
            PatientCheckExitValidation,
            ExamRecordCreateValidation,
            DoctorCreateValidation,
            AppointmentListValidation,
            CreateMedicalHistoryDto,
            ExamplaceCreateValidation,
            ExamplaceUpdateValidation,
            TypeBaseUpdateValidation,
            TypeBaseCreateValidation,
            DepartmentCreateValidation,
            DepartmentUpdateValidation,
            EducationCreateValidation,
            EducationUpdateValidation,
            PointLadderCreateValidation
        ];
        return types.includes(metatype);
    }
}
