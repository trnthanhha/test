import { DoctorEntity } from '../doctor/doctor.schema';
import { Document } from 'mongoose';

export type ForgetDocument = DoctorEntity & Document;

export interface IForgetDocument extends Pick<DoctorEntity, 'email' | 'exam_place'> {
    email: string;
    exam_place: string;
}
