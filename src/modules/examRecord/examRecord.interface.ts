import { Document } from "mongoose";
import { ExamRecordEntity } from "./examRecord.schema";

export type ExamRecordDocument = ExamRecordEntity & Document

export type IExamRecordDocument = ExamRecordDocument

export type IExamRecordCreate = Omit<ExamRecordEntity, 'options'>
