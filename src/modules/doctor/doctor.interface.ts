import { DoctorEntity } from './doctor.schema';
import { Document } from 'mongoose';
import { ITypeBaseDocument } from '../typebase/typebase.interface';
import { IExamplaceDocument } from '../examplace/examplace.interface';
import { IEducationDocument } from '../education/education.interface';
import { IDepartmentDocument } from '../department/department.interface';
import { type } from 'os';

export type DoctorDocument = DoctorEntity & Document;

export interface IDoctorDocument 
    extends Omit<DoctorDocument, 'type_base' | 'exam_place' | 'education' | 'department'> {
        type_base: ITypeBaseDocument;
        exam_place: IExamplaceDocument;
        education: IEducationDocument;
        department: IDepartmentDocument;
}

export interface IDoctorCreate {
    email: string;
    password: string;
    name: string;
    type_base: string;
    exam_place: string;
    education: string;
    department: string;
}

export interface IDoctorUpdate {
    email: string;
    password: string;
    name: string;
    type_base: string;
    exam_place: string;
    education: string;
    department: string;
    isActive: boolean;
} 

export interface IActiveDoctor {
    isActive: boolean;
}