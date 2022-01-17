import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaginationModule } from 'src/pagination/pagination.module';
import { DoctorService } from 'src/modules/doctor/doctor.service';
import { DoctorController } from './doctor.controller';
import { DoctorDatabaseName, DoctorEntity, DoctorSchema } from './doctor.schema';
import { SendMailModule } from '../sendMail/sendMail.module';

@Module({
    controllers: [DoctorController],
    providers: [DoctorService],
    exports: [DoctorService],
    imports: [
        MongooseModule.forFeature([
            {
                name: DoctorEntity.name,
                schema: DoctorSchema,
                collection: DoctorDatabaseName
            }
        ]),
        PaginationModule,
        SendMailModule
    ]
})
export class DoctorModule {}
