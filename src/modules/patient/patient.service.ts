import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IErrors } from 'src/error/error.interface';
import { Message } from 'src/message/message.decorator';
import { MessageService } from 'src/message/message.service';
import {
    IPatientCheckExit,
    IPatientCreate,
    PatientDocument
} from './patient.interface';
import { PatientEntity } from './patient.schema';

@Injectable()
export class PatientService {
    constructor(
        @InjectModel(PatientEntity.name)
        private readonly patientModel: Model<PatientDocument>,
        @Message() private readonly messageService: MessageService
    ) {}

    async checkExist(phone: string): Promise<IErrors[]> {
        const existMobileNumber: PatientDocument = await this.findPatient({
            phone
        });

        const errors: IErrors[] = [];
        if (existMobileNumber) {
            errors.push({
                message: this.messageService.get('user.error.phoneExist'),
                property: 'phone'
            });
        }

        return errors;
    }

    async create(entity: IPatientCreate): Promise<PatientDocument> {
        const create: PatientDocument = await new this.patientModel(entity);
        return create.save();
    }

    async findPatient(data: IPatientCheckExit): Promise<PatientDocument> {
        return await this.patientModel.findOne(data).lean();
    }
}
