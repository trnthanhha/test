import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PointLadderController } from './pointladder.controller';
import { PointLadderDatabaseName, PointLadderEntity, PointLadderSchema } from './pointladder.schema';
import { PointLadderService } from './pointladder.service';

@Module({
    controllers: [PointLadderController],
    providers: [PointLadderService],
    exports: [PointLadderService],
    imports: [
        MongooseModule.forFeature([
            {
                name: PointLadderEntity.name,
                schema: PointLadderSchema,
                collection: PointLadderDatabaseName
            }
        ]),
    ]
})
export class PointLadderModule {}
