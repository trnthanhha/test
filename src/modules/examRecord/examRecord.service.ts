import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExamRecordDocument, IExamRecordCreate, IExamRecordDocument } from "./examRecord.interface";
import { ExamRecordEntity } from "./examRecord.schema";

@Injectable()
export class ExamRecordService{
    constructor(
        @InjectModel(ExamRecordEntity.name)
        private readonly examRecorModel: Model<ExamRecordDocument>,
    ) {}
}