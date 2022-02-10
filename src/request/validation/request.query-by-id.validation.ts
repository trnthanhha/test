import {
    IsMongoId, IsString,

} from 'class-validator';

export class QueryByIdValidation {
    @IsMongoId()
    readonly _id: string
}
