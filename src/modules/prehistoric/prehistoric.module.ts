import { forwardRef, Module } from '@nestjs/common';
import { PrehistoricService } from './prehistoric.service';
import { PrehistoricController } from './prehistoric.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Prehistoric, PrehistoricDatabaseName, PrehistoricSchema } from './Schema/prehistoric.schema';
import { PatientModule } from '../patient/patient.module';

// Tiền Sử
@Module({
  imports: [
    MongooseModule.forFeature([
        {
            name: Prehistoric.name,
            schema: PrehistoricSchema,
            collection: PrehistoricDatabaseName
        }
    ]),
    forwardRef(()=> PatientModule)
  ],
  controllers: [PrehistoricController],
  providers: [PrehistoricService]
})
export class PrehistoricModule {}
