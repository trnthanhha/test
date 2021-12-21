import { DoctorEntity } from './doctor.schema';
import { Document } from 'mongoose';

export type DoctorDocument = DoctorEntity & Document;

export type IDoctorDocument = DoctorDocument // tạm thời

export interface IDoctorCreate {
    email: string;
    password: string;
    name: string;
    type_base: string;
    exam_place: string;
    education: string;
    department: string;
}
