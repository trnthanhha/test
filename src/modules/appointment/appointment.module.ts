import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaginationModule } from 'src/pagination/pagination.module';
import { PatientModule } from '../patient/patient.module';
import { SendSMSModule } from '../sendSMS/sendSMS.module';
import { AppointmentController } from './appointment.controller';
import {
    AppointmentDatabaseName,
    AppointmentEntity,
    AppointmentSchema
} from './appointment.schema';
import { AppointmentService } from './appointment.service';

@Module({
    providers: [AppointmentService],
    exports: [AppointmentService],
    imports: [
        MongooseModule.forFeature([
            {
                name: AppointmentEntity.name,
                schema: AppointmentSchema,
                collection: AppointmentDatabaseName
            }
        ]),
        PaginationModule,
        SendSMSModule,
        PatientModule
    ],
    controllers: [AppointmentController]
})
export class AppointmentModule {}
