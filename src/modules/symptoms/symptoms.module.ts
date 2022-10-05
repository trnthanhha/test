import { forwardRef, Module } from '@nestjs/common';
import { SymptomsService } from './symptoms.service';
import { SymptomsController } from './symptoms.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Symptom, SymptomDatabaseName, SymptomSchema } from './Schema/symptom.schema';
import { PatientModule } from '../patient/patient.module';

@Module({
  imports: [
    MongooseModule.forFeature([
        {
            name: Symptom.name,
            schema: SymptomSchema,
            collection: SymptomDatabaseName
        }
    ]),
    forwardRef(()=> PatientModule)
  ],
  controllers: [SymptomsController],
  providers: [SymptomsService]
})
export class SymptomsModule {}
