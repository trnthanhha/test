import { Document } from 'mongoose';
import { IDoctorDocument } from '../doctor/doctor.interface';
import { IPatientDocument } from '../patient/patient.interface';
import { AppointmentEntity } from './appointment.schema';

export type AppointmentDocument = AppointmentEntity & Document;

export interface IAppointmentDocument 
    extends Omit<AppointmentDocument, 'doctor_id' | 'patient_id'> {
    doctor_id: IDoctorDocument;
    patient_id: IPatientDocument;
}

export interface IAppointmentCreate {
    name?: string;
    desc?: string;
    type: string;
    date: Date;
    exam_place_id?: string;
    doctor_id: string;
    patient_id: string;
}

export type IAppointmentUpdate = IAppointmentCreate;
