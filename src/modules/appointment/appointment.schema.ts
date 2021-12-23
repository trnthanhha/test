import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { DoctorEntity } from '../doctor/doctor.schema';
import { ExamplaceEntity } from '../examplace/examplace.schema';
import { PatientEntity } from '../patient/patient.schema';
import { ENUM_APPOINTMENT_TYPE } from './appointment.constant';

@Schema()
export class AppointmentEntity {
    @Prop({
        required: false, //tạm thời ko yêu cầu
        trim: true
    })
    name?: string;

    @Prop({
        required: false,
        trim: true
    })
    desc?: string;

    @Prop({
        required: true, //tạm thời ko yêu cầu
        enum: ENUM_APPOINTMENT_TYPE,
        index: true
    })
    type: string;

    @Prop({
        required: true,
        index: true
    })
    date: Date;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: ExamplaceEntity.name,
        index: true
    })
    exam_place_id: Types.ObjectId;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: DoctorEntity.name,
        index: true
    })
    doctor_id: Types.ObjectId;

    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: PatientEntity.name,
        index: true
    })
    patient_id: Types.ObjectId;
}

export const AppointmentDatabaseName = 'appointment';
export const AppointmentSchema = SchemaFactory.createForClass(
    AppointmentEntity
);
