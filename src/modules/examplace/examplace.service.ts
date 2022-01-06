import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IExamplaceCreate, IExamplaceDocument, IExamplaceUpdate } from './examplace.interface';
import { ExamplaceEntity } from './examplace.schema';

@Injectable()
export class ExamplaceService {
    constructor(
        @InjectModel(ExamplaceEntity.name)
        private readonly examplaceModel: Model<IExamplaceDocument>
    ) {}
    async findAll(): Promise<IExamplaceDocument> {
        return this.examplaceModel.find({}).lean();
    }

    async findOneById(_id: string): Promise<IExamplaceDocument> {
        return this.examplaceModel.findOne({_id}).lean();
    }

    async create(entity: IExamplaceCreate): Promise<IExamplaceDocument> {
        const create: IExamplaceDocument = await new this.examplaceModel(
            entity
        );
        return create.save();
    }
    
    async updateOneById(
        _id: string,
        data: IExamplaceUpdate
    ): Promise<IExamplaceDocument> {
        return await this.examplaceModel.updateOne(
            {
                _id: new Types.ObjectId(_id)
            },
            data
        );
    }

    async deleteOneById(_id: string): Promise<boolean> {
        return this.examplaceModel.deleteOne({
            _id: new Types.ObjectId(_id)
        });
    }
}
