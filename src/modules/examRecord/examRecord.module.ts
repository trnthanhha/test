import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamRecordController } from './examRecord.controller';
import { ExamRecordDatabaseName, ExamRecordEntity, ExamRecordSchema } from './examRecord.schema';
import { ExamRecordService } from './examRecord.service';

@Module({
    controllers: [ExamRecordController],
    providers: [ExamRecordService],
    exports: [ExamRecordService],
    imports: [
        MongooseModule.forFeature([
            {
                name: ExamRecordEntity.name,
                schema: ExamRecordSchema,
                collection: ExamRecordDatabaseName
            }
        ]),
    ]
})
export class ExamRecordModule {}
