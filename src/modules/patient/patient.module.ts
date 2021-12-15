import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaginationModule } from 'src/pagination/pagination.module';
import { PatientService } from 'src/modules/patient/patient.service';
import { PatientController } from './patient.controller';
import { PatientDatabaseName, PatientEntity, PatientSchema } from './patient.schema';

@Module({
    controllers: [PatientController],
    providers: [PatientService],
    exports: [PatientService],
    imports: [
        MongooseModule.forFeature([
            {
                name: PatientEntity.name,
                schema: PatientSchema,
                collection: PatientDatabaseName
            }
        ]),
        PaginationModule
    ]
})
export class PatientModule {}
