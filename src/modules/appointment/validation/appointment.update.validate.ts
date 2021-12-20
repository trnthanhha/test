import {
    IsString,
    IsNotEmpty,
    IsMongoId,
    IsOptional,
    IsDateString,
    IsIn,
} from 'class-validator';
import { ENUM_APPOINTMENT_TYPE } from '../appointment.constant';

export class AppointmentUpdateValidation {
    @IsString()
    @IsOptional()
    // @IsNotEmpty()
    readonly name?: string;

    @IsString()
    @IsOptional()
    // @IsNotEmpty()
    readonly desc?: string;

    @IsString()
    @IsOptional()
    @IsIn(Object.values(ENUM_APPOINTMENT_TYPE))
    readonly type: string;

    @IsDateString()
    @IsOptional()
    @IsNotEmpty()
    readonly date: Date;

    @IsMongoId()
    @IsOptional()
    // @IsNotEmpty()
    readonly exam_place_id?: string;

    @IsMongoId()
    @IsOptional()
    @IsNotEmpty()
    readonly doctor_id: string;

    @IsMongoId()
    @IsOptional()
    @IsNotEmpty()
    readonly patient_id: string;
}
