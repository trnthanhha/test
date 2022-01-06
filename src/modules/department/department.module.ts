import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentController } from './department.controller';
import { DepartmentDatabaseName, DepartmentEntity, DepartmentSchema } from './department.schema';
import { DepartmentService } from './department.service';

@Module({
    controllers: [DepartmentController],
    providers: [DepartmentService],
    exports: [DepartmentService],
    imports: [
        MongooseModule.forFeature([
            {
                name: DepartmentEntity.name,
                schema: DepartmentSchema,
                collection: DepartmentDatabaseName
            }
        ]),
    ]
})
export class DepartmentModule {}
