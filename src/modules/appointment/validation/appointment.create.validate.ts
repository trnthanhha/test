import {
    IsString,
    IsNotEmpty,
    IsMongoId,
    IsDateString,
    IsOptional,
    IsIn
} from 'class-validator';
import { ENUM_APPOINTMENT_TYPE } from '../appointment.constant';

export class AppointmentCreateValidation {
    @IsString()
    // @IsNotEmpty()
    @IsOptional()
    readonly name?: string;

    @IsString()
    // @IsNotEmpty()
    @IsOptional()
    readonly desc?: string;

    @IsString()
    @IsIn(Object.values(ENUM_APPOINTMENT_TYPE))
    readonly type: string;

    @IsDateString()
    @IsNotEmpty()
    readonly date: Date;

    @IsMongoId()
    // @IsNotEmpty()
    @IsOptional()
    readonly exam_place_id?: string;

    @IsMongoId()
    @IsNotEmpty()
    readonly doctor_id: string;

    @IsMongoId()
    @IsNotEmpty()
    readonly patient_id: string;
}
