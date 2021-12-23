import { forwardRef, Module } from '@nestjs/common';
import { MedicalHistoryService } from './medical-history.service';
import { MedicalHistoryController } from './medical-history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MedicalHistory, MedicalHistoryDatabaseName, MedicalHistorySchema } from './Schema/medical-history.schema';
import { PatientModule } from '../patient/patient.module';

// bệnh sử
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MedicalHistory.name,
        schema: MedicalHistorySchema,
        collection: MedicalHistoryDatabaseName
      }
    ]),
    forwardRef(()=> PatientModule)
  ],
  controllers: [MedicalHistoryController],
  providers: [MedicalHistoryService]
})
export class MedicalHistoryModule { }
