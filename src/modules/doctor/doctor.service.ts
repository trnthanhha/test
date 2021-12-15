import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IDoctorCreate, DoctorDocument } from './doctor.interface';
import { DoctorEntity } from './doctor.schema';

@Injectable()
export class DoctorService {
    constructor(
        @InjectModel(DoctorEntity.name)
        private readonly doctorModel: Model<DoctorDocument>
    ) {}
}
