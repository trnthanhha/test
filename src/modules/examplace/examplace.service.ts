import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IExamplaceCreate, ExamplaceDocument } from './examplace.interface';
import { ExamplaceEntity } from './examplace.schema';

@Injectable()
export class ExamplaceService {
    constructor(
        @InjectModel(ExamplaceEntity.name)
        private readonly examplaceModel: Model<ExamplaceDocument>
    ) {}
}
