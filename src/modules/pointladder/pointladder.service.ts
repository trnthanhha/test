import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IPatientDocument } from '../patient/patient.interface';
import {
    PointLadderDocument,
    IPointLadderCreate,
    IPointLadderDocument
} from './pointladder.interface';
import { PointLadderEntity } from './pointladder.schema';
import { PointLadderCreateValidation } from './validation/pointladder.create.validate';

@Injectable()
export class PointLadderService {
    constructor(
        @InjectModel(PointLadderEntity.name)
        private readonly pointLadderModel: Model<PointLadderDocument>
    ) {}

    async create(
        entity: PointLadderCreateValidation
    ): Promise<IPointLadderDocument> {
        const newPointLadder: PointLadderEntity = {
            ...entity,
            patient_id: new Types.ObjectId(entity.patient_id)
        };
        const create: IPointLadderDocument = await new this.pointLadderModel(
            newPointLadder
        );
        return create.save();
    }

    async checkExitPatient(patient_id: string): Promise<IPointLadderDocument> {
        return this.pointLadderModel.findOne({ patient_id: new Types.ObjectId(patient_id) });
    }

    async update(
        entity: PointLadderCreateValidation
    ): Promise<IPointLadderDocument> {
        const newPointLadder: PointLadderEntity = {
            ...entity,
            patient_id: new Types.ObjectId(entity.patient_id)
        };
        return this.pointLadderModel.findOneAndUpdate(
            {
                patient_id: new Types.ObjectId(entity.patient_id)
            },
            newPointLadder
        );
    }

    async findOneByIdPatient(patient_id: string): Promise<IPatientDocument> {
        return this.pointLadderModel.findOne({
            patient_id: new Types.ObjectId(patient_id)
        })
    }
}
