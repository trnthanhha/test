import { PatientEntity } from './patient.schema';
import { Document } from 'mongoose';

export type PatientDocument = PatientEntity & Document;

export type IPatientDocument = PatientDocument;

export interface IPatientCreate {
    name: string;
    numberProfile?: string;
    preferredHand?: string;
    nation?: string;
    birthday?: Date;
    gender?: boolean;
    address: string;
    phone: string;
    email: string;
    job: string;
    education?: string;
    nationality?: string;
    relative_patient?: string;
    relative_name?: string;
    relative_phone?: string;
}

export type IPatientUpdate = Omit<IPatientCreate, 'phone'>;

export interface IPatientCheckExit {
    phone: string;
}
