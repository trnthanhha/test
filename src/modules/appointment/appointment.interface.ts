import { Document } from 'mongoose';
import { IDoctorDocument } from '../doctor/doctor.interface';
import { IExamplaceDocument } from '../examplace/examplace.interface';
import { IPatientDocument } from '../patient/patient.interface';
import { AppointmentEntity } from './appointment.schema';

export type AppointmentDocument = AppointmentEntity & Document;

export interface IAppointmentDocument 
    extends Omit<AppointmentDocument, 'doctor_id' | 'patient_id' | 'exam_place_id'> {
    doctor_id: IDoctorDocument;
    patient_id: IPatientDocument;
    exam_place_id: IExamplaceDocument
}

export interface IAppointmentCreate {
    type: string;
    date: Date;
    exam_place_id: string;
    doctor_id: string;
    patient_id: string;
}

export type IAppointmentUpdate = IAppointmentCreate;
