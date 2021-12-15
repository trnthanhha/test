import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IPatientCreate, PatientDocument } from './patient.interface';
import { PatientEntity } from './patient.schema';

@Injectable()
export class PatientService {
    constructor(
        @InjectModel(PatientEntity.name)
        private readonly patientModel: Model<PatientDocument>
    ) {}
}
