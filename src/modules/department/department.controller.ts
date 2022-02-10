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
import { IDepartmentDocument } from '../department/department.interface';
import { DepartmentService } from './department.service';
import { DepartmentCreateValidation } from './validation/department.create.validation';
import { DepartmentUpdateValidation } from './validation/department.update.validation';
import { ENUM_DEPARTMENT_STATUS_CODE_ERROR } from './department.constant';
import { QueryByIdValidation } from 'src/request/validation/request.query-by-id.validation';

@Controller('/department')
export class DepartmentController {
    constructor(private readonly departmentService: DepartmentService) {}
    @Response('department.findAll')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/list')
    async findAll(): Promise<IResponse> {
        return this.departmentService.findAll();
    }

    @Response('department.findOneById')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/detail/:_id')
    async findOneById(@Param(RequestValidationPipe) _id: QueryByIdValidation): Promise<IResponse> {
        const department = await this.departmentService.findOneById(_id as unknown as string);

        if (department) {
            return department;
        } else {
            throw new BadRequestException({
                statusCode:
                    ENUM_DEPARTMENT_STATUS_CODE_ERROR.DEPARTMENT_NOT_FOUND_ERROR,
                message: 'department.error.notFound'
            });
        }
    }

    @Response('department.create')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_CREATE)
    @Post('/create')
    async create(
        @Body(RequestValidationPipe) data: DepartmentCreateValidation
    ): Promise<IResponse> {
        const create = await this.departmentService.create(data);
        return {
            _id: create._id
        };
    }

    @Response('department.update')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_UPDATE)
    @Put('/update/:_id')
    async update(
        @Param(RequestValidationPipe) _id: QueryByIdValidation,
        @Body(RequestValidationPipe) data: DepartmentUpdateValidation
    ): Promise<IResponse> {
        const department: IDepartmentDocument = await this.departmentService.findOneById(
            _id as unknown as string
        );

        if (!department) {
            throw new NotFoundException({
                statusCode:
                    ENUM_DEPARTMENT_STATUS_CODE_ERROR.DEPARTMENT_NOT_FOUND_ERROR,
                message: 'department.error.notFound'
            });
        }

        await this.departmentService.updateOneById(_id as unknown as string, data);
        return {
            _id
        };
    }

    @Response('department.delete')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_DELETE)
    @Delete('/delete/:_id')
    async delete(@Param(RequestValidationPipe) _id: QueryByIdValidation): Promise<void> {
        const department: IDepartmentDocument = await this.departmentService.findOneById(
            _id as unknown as string
        );
        if (!department) {
            throw new NotFoundException({
                statusCode:
                    ENUM_DEPARTMENT_STATUS_CODE_ERROR.DEPARTMENT_NOT_FOUND_ERROR,
                message: 'department.error.notFound'
            });
        }

        await this.departmentService.deleteOneById(_id as unknown as string);
        return;
    }
}
