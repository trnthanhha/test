import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeBaseController } from './typebase.controller';
import { TypeBaseDatabaseName, TypeBaseEntity, TypeBaseSchema } from './typebase.schema';
import { TypeBaseService } from './typebase.service';

@Module({
    controllers: [TypeBaseController],
    providers: [TypeBaseService],
    exports: [TypeBaseService],
    imports: [
        MongooseModule.forFeature([
            {
                name: TypeBaseEntity.name,
                schema: TypeBaseSchema,
                collection: TypeBaseDatabaseName
            }
        ]),
    ]
})
export class TypeBaseModule {}
