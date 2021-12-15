import { ExamplaceEntity } from './examplace.schema';
import { Document } from 'mongoose';
import { PermissionDocument } from 'src/modules/permission/permission.interface';

export type ExamplaceDocument = ExamplaceEntity & Document;

export interface IExamplaceDocument extends Omit<ExamplaceDocument, 'permissions'> {
    permissions: PermissionDocument[];
}

export interface IExamplaceFullDocument extends Omit<ExamplaceEntity, 'permissions'> {
    name: string;
    permissions: string[];
}

export interface IExamplaceCreate {
    name: string;
    permissions: string[];
}
