import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorEntity } from '../doctor/doctor.schema';
import { ExamplaceEntity } from '../examplace/examplace.schema';
import { PatientEntity } from '../patient/patient.schema';
import {
    AppointmentDocument,
    IAppointmentCreate,
    IAppointmentUpdate
} from './appointment.interface';
import { AppointmentEntity } from './appointment.schema';

@Injectable()
export class AppointmentService {
    constructor(
        @InjectModel(AppointmentEntity.name)
        private readonly appointmentModel: Model<AppointmentDocument>
    ) {}

    async findAll<T>(
        find?: Record<string, any>,
        options?: Record<string, any>
    ): Promise<T[]> {
        const appointments = this.appointmentModel
            .find(find)
            .skip(options && options.skip ? options.skip : 0);

        if (options && options.limit) {
            appointments.limit(options.limit);
        }

        if (options && options.sort) {
            appointments.sort(options.sort);
        }

        if (options && options.populate) {
            appointments
                .populate({
                    path: 'doctor_id',
                    model: DoctorEntity.name
                })
                .populate({
                    path: 'patient_id',
                    model: PatientEntity.name
                })
                .populate({
                    path: 'exam_place_id',
                    model: ExamplaceEntity.name
                });
        }

        return appointments.lean();
    }

    async getTotalData(find: Record<string, any>): Promise<number> {
        return this.appointmentModel.countDocuments(find);
    }

    async create(entity: IAppointmentCreate): Promise<AppointmentDocument> {
        const newAppointment: AppointmentEntity = {
            ...entity,
            doctor_id: new Types.ObjectId(entity.doctor_id),
            exam_place_id: new Types.ObjectId(entity.exam_place_id),
            patient_id: new Types.ObjectId(entity.patient_id)
        };
        const create: AppointmentDocument = await new this.appointmentModel(
            newAppointment
        );
        return create.save();
    }

    async findOneById<T>(
        _id: string,
        options?: Record<string, any>
    ): Promise<T> {
        const appointment = this.appointmentModel.findById(_id);

        if (options && options.populate) {
            appointment
                .populate({
                    path: 'doctor_id',
                    model: DoctorEntity.name
                })
                .populate({
                    path: 'patient_id',
                    model: PatientEntity.name
                })
                .populate({
                    path: 'exam_place_id',
                    model: ExamplaceEntity.name
                });
        }

        return appointment.lean();
    }

    async deleteOneById(_id: string): Promise<boolean> {
        try {
            await this.appointmentModel.deleteOne({
                _id: new Types.ObjectId(_id)
            });
            return true;
        } catch (e: unknown) {
            return false;
        }
    }

    async updateOneById(
        _id: string,
        data: IAppointmentUpdate
    ): Promise<AppointmentDocument> {
        return await this.appointmentModel.updateOne(
            {
                _id: new Types.ObjectId(_id)
            },
            data
        );
    }
}
