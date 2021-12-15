import { PatientEntity } from './patient.schema';
import { Document } from 'mongoose';
import { PermissionDocument } from 'src/modules/permission/permission.interface';

export type PatientDocument = PatientEntity & Document;

export interface IPatientDocument extends Omit<PatientDocument, 'permissions'> {
    permissions: PermissionDocument[];
}

export interface IPatientFullDocument extends Omit<PatientEntity, 'permissions'> {
    name: string;
    permissions: string[];
}

export interface IPatientCreate {
    name: string;
    permissions: string[];
}
