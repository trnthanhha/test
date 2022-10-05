import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
} from '@nestjs/common';
import { RequestValidationPipe } from 'src/request/pipe/request.validation.pipe';
import { Response } from 'src/response/response.decorator';
import { IResponse } from 'src/response/response.interface';
import { ITypeBaseDocument } from '../typebase/typebase.interface';
import { TypeBaseService } from './typebase.service';
import { TypeBaseCreateValidation } from './validation/typebase.create.validation';
import { TypeBaseUpdateValidation } from './validation/typebase.update.validation';
import { ENUM_TYPEBASE_STATUS_CODE_ERROR } from './typebase.constant';
import { QueryByIdValidation } from 'src/request/validation/request.query-by-id.validation';

@Controller('/typebase')
export class TypeBaseController {
    constructor(private readonly typeBaseService: TypeBaseService) {}
    @Response('typebase.findAll')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/list')
    async findAll(): Promise<IResponse> {
        return this.typeBaseService.findAll();
    }

    @Response('typebase.findOneById')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/detail/:_id')
    async findOneById(@Param(RequestValidationPipe) _id: QueryByIdValidation): Promise<IResponse> {
        const typeBase = await this.typeBaseService.findOneById(_id as unknown as string);

        if (typeBase) {
            return typeBase;
        } else {
            throw new BadRequestException({
                statusCode:
                    ENUM_TYPEBASE_STATUS_CODE_ERROR.TYPEBASE_NOT_FOUND_ERROR,
                message: 'typebase.error.notFound'
            });
        }
    }

    @Response('typebase.create')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_CREATE)
    @Post('/create')
    async create(
        @Body(RequestValidationPipe) data: TypeBaseCreateValidation
    ): Promise<IResponse> {
        const create = await this.typeBaseService.create(data);
        return {
            _id: create._id
        };
    }

    @Response('typebase.update')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_UPDATE)
    @Put('/update/:_id')
    async update(
        @Param(RequestValidationPipe) _id: QueryByIdValidation,
        @Body(RequestValidationPipe) data: TypeBaseUpdateValidation
    ): Promise<IResponse> {
        const typeBase: ITypeBaseDocument = await this.typeBaseService.findOneById(
            _id as unknown as string
        );

        if (!typeBase) {
            throw new NotFoundException({
                statusCode:
                    ENUM_TYPEBASE_STATUS_CODE_ERROR.TYPEBASE_NOT_FOUND_ERROR,
                message: 'typebase.error.notFound'
            });
        }

        await this.typeBaseService.updateOneById(_id as unknown as string, data);
        return {
            _id
        };
    }

    @Response('typebase.delete')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_DELETE)
    @Delete('/delete/:_id')
    async delete(@Param(RequestValidationPipe) _id: QueryByIdValidation): Promise<void> {
        const typeBase: ITypeBaseDocument = await this.typeBaseService.findOneById(
            _id as unknown as string
        );
        if (!typeBase) {
            throw new NotFoundException({
                statusCode:
                    ENUM_TYPEBASE_STATUS_CODE_ERROR.TYPEBASE_NOT_FOUND_ERROR,
                message: 'typebase.error.notFound'
            });
        }

        await this.typeBaseService.deleteOneById(_id as unknown as string);
        return;
    }
}
