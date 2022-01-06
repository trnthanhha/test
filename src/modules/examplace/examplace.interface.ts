import { ExamplaceEntity } from './examplace.schema';
import { Document } from 'mongoose';

export type ExamplaceDocument = ExamplaceEntity & Document;

export type IExamplaceDocument = ExamplaceDocument;

export interface IExamplaceCreate {
    name: string;
    address: string;
    type: string;
}

export type IExamplaceUpdate = IExamplaceCreate;
