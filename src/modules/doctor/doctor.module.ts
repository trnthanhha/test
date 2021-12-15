import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaginationModule } from 'src/pagination/pagination.module';
import { DoctorService } from 'src/modules/doctor/doctor.service';
import { DoctorController } from './doctor.controller';
import { DoctorDatabaseName, DoctorEntity, DoctorSchema } from './doctor.schema';

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
        PaginationModule
    ]
})
export class DoctorModule {}
