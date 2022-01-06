import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EducationController } from './education.controller';
import { EducationDatabaseName, EducationEntity, EducationSchema } from './education.schema';
import { EducationService } from './education.service';

@Module({
    controllers: [EducationController],
    providers: [EducationService],
    exports: [EducationService],
    imports: [
        MongooseModule.forFeature([
            {
                name: EducationEntity.name,
                schema: EducationSchema,
                collection: EducationDatabaseName
            }
        ]),
    ]
})
export class EducationModule {}
