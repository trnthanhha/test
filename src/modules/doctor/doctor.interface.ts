import { DoctorEntity } from './doctor.schema';
import { Document } from 'mongoose';
import { PermissionDocument } from 'src/modules/permission/permission.interface';

export type DoctorDocument = DoctorEntity & Document;

export interface IDoctorDocument extends Omit<DoctorDocument, 'permissions'> {
    permissions: PermissionDocument[];
}

export interface IDoctorFullDocument extends Omit<DoctorEntity, 'permissions'> {
    firstName: string;
    permissions: string[];
}

export interface IDoctorCreate {
    firstName: string;
    permissions: string[];
}
