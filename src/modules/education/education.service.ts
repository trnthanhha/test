import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
    IEducationDocument,
    IEducationCreate,
    IEducationUpdate
} from './education.interface';
import { EducationEntity } from './education.schema';

@Injectable()
export class EducationService {
    constructor(
        @InjectModel(EducationEntity.name)
        private readonly educationModel: Model<IEducationDocument>
    ) {}
    async findAll(): Promise<IEducationDocument> {
        return this.educationModel.find({}).lean();
    }

    async findOneById(_id: string): Promise<IEducationDocument> {
        return this.educationModel.findOne({ _id }).lean();
    }

    async create(entity: IEducationCreate): Promise<IEducationDocument> {
        const create: IEducationDocument = await new this.educationModel(
            entity
        );
        return create.save();
    }

    async updateOneById(
        _id: string,
        data: IEducationUpdate
    ): Promise<IEducationDocument> {
        return await this.educationModel.updateOne(
            {
                _id: new Types.ObjectId(_id)
            },
            data
        );
    }

    async deleteOneById(_id: string): Promise<boolean> {
        return this.educationModel.deleteOne({
            _id: new Types.ObjectId(_id)
        });
    }
}
