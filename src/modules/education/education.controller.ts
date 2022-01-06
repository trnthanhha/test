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
import { IEducationDocument } from '../education/education.interface';
import { EducationService } from './education.service';
import { EducationCreateValidation } from './validation/education.create.validation';
import { EducationUpdateValidation } from './validation/education.update.validation';
import { ENUM_EDUCATION_STATUS_CODE_ERROR } from './education.constant';

@Controller('/education')
export class EducationController {
    constructor(private readonly educationService: EducationService) {}
    @Response('education.findAll')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/list')
    async findAll(): Promise<IResponse> {
        return this.educationService.findAll();
    }

    @Response('education.findOneById')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/detail/:_id')
    async findOneById(@Param('_id') _id: string): Promise<IResponse> {
        const education = await this.educationService.findOneById(_id);

        if (education) {
            return education;
        } else {
            throw new BadRequestException({
                statusCode:
                    ENUM_EDUCATION_STATUS_CODE_ERROR.EDUCATION_NOT_FOUND_ERROR,
                message: 'education.error.notFound'
            });
        }
    }

    @Response('education.create')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_CREATE)
    @Post('/create')
    async create(
        @Body(RequestValidationPipe) data: EducationCreateValidation
    ): Promise<IResponse> {
        const create = await this.educationService.create(data);
        return {
            _id: create._id
        };
    }

    @Response('education.update')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_UPDATE)
    @Put('/update/:_id')
    async update(
        @Param('_id') _id: string,
        @Body(RequestValidationPipe) data: EducationUpdateValidation
    ): Promise<IResponse> {
        const education: IEducationDocument = await this.educationService.findOneById(
            _id
        );

        if (!education) {
            throw new NotFoundException({
                statusCode:
                    ENUM_EDUCATION_STATUS_CODE_ERROR.EDUCATION_NOT_FOUND_ERROR,
                message: 'education.error.notFound'
            });
        }

        await this.educationService.updateOneById(_id, data);
        return {
            _id
        };
    }

    @Response('education.delete')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_DELETE)
    @Delete('/delete/:_id')
    async delete(@Param('_id') _id: string): Promise<void> {
        const education: IEducationDocument = await this.educationService.findOneById(
            _id
        );
        if (!education) {
            throw new NotFoundException({
                statusCode:
                    ENUM_EDUCATION_STATUS_CODE_ERROR.EDUCATION_NOT_FOUND_ERROR,
                message: 'education.error.notFound'
            });
        }

        await this.educationService.deleteOneById(_id);
        return;
    }
}
