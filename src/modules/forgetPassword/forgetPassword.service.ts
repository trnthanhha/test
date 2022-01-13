import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorDocument } from '../doctor/doctor.interface';
import { DoctorEntity } from '../doctor/doctor.schema';

@Injectable()
export class ForgetPasswordService {
    constructor(
        @InjectModel(DoctorEntity.name)
        private readonly doctorModel: Model<DoctorDocument>

    ) {}
    async updateOneById(_id: string, password: string): Promise<DoctorDocument> {
        return this.doctorModel.updateOne(
            {
                _id: new Types.ObjectId(_id)
            },
            {
                password
            }
        );
    }
}
