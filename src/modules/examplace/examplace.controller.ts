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
import { ExamplaceService } from './examplace.service';
import { IResponse } from 'src/response/response.interface';
import { Response } from 'src/response/response.decorator';
import { ExamplaceCreateValidation } from './validation/examplace.create.validation';
import { RequestValidationPipe } from 'src/request/pipe/request.validation.pipe';
import { ExamplaceUpdateValidation } from './validation/examplace.update.validation';
import { ENUM_EXAMPLACE_STATUS_CODE_ERROR } from './examplace.constant';
import { IExamplaceDocument } from './examplace.interface';
import { QueryByIdValidation } from 'src/request/validation/request.query-by-id.validation';

@Controller('/examplace')
export class ExamplaceController {
    constructor(
        private readonly examplaceService: ExamplaceService
    ) {}
    @Response('examplace.findAll')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/list')
    async findAll(): Promise<IResponse> {
        return this.examplaceService.findAll();
    }

    @Response('examplace.findOneById')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/detail/:_id')
    async findOneById(@Param(RequestValidationPipe) _id: QueryByIdValidation): Promise<IResponse> {
        const examplace = await this.examplaceService.findOneById(_id as unknown as string);

        if (examplace) {
            return examplace;
        } else {
            throw new BadRequestException({
                statusCode:
                    ENUM_EXAMPLACE_STATUS_CODE_ERROR.EXAMPLACE_NOT_FOUND_ERROR,
                message: 'examplace.error.getNotFound'
            });
        }
    }

    @Response('examplace.create')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_CREATE)
    @Post('/create')
    async create(
        @Body(RequestValidationPipe) data: ExamplaceCreateValidation
    ): Promise<IResponse> {
        const create = await this.examplaceService.create(data);
        return {
            _id: create._id
        };
    }

    @Response('examplace.update')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_UPDATE)
    @Put('/update/:_id')
    async update(
        @Param(RequestValidationPipe) _id: QueryByIdValidation,
        @Body(RequestValidationPipe) data: ExamplaceUpdateValidation
    ): Promise<IResponse> {
        const examplace: IExamplaceDocument = await this.examplaceService.findOneById(
            _id as unknown as string
        );

        if (!examplace) {
            throw new NotFoundException({
                statusCode:
                    ENUM_EXAMPLACE_STATUS_CODE_ERROR.EXAMPLACE_NOT_FOUND_ERROR,
                message: 'examplace.error.notFound'
            });
        }

        await this.examplaceService.updateOneById(_id as unknown as string, data);
        return {
            _id
        };
    }

    @Response('examplace.delete')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_DELETE)
    @Delete('/delete/:_id')
    async delete(@Param(RequestValidationPipe) _id: QueryByIdValidation): Promise<void> {
        const examplace: IExamplaceDocument = await this.examplaceService.findOneById(
            _id as unknown as string
        );
        if (!examplace) {
            throw new NotFoundException({
                statusCode:
                    ENUM_EXAMPLACE_STATUS_CODE_ERROR.EXAMPLACE_NOT_FOUND_ERROR,
                message: 'examplace.error.notFound'
            });
        }

        await this.examplaceService.deleteOneById(_id as unknown as string);
        return;
    }
}
