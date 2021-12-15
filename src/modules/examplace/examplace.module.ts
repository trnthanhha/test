import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaginationModule } from 'src/pagination/pagination.module';
import { ExamplaceService } from 'src/modules/examplace/examplace.service';
import { ExamplaceController } from './examplace.controller';
import { ExamplaceDatabaseName, ExamplaceEntity, ExamplaceSchema } from './examplace.schema';

@Module({
    controllers: [ExamplaceController],
    providers: [ExamplaceService],
    exports: [ExamplaceService],
    imports: [
        MongooseModule.forFeature([
            {
                name: ExamplaceEntity.name,
                schema: ExamplaceSchema,
                collection: ExamplaceDatabaseName
            }
        ]),
        PaginationModule
    ]
})
export class ExamplaceModule {}
