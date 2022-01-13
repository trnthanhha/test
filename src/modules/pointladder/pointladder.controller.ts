import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Param, Post } from "@nestjs/common";
import { ENUM_STATUS_CODE_ERROR } from "src/error/error.constant";
import { RequestValidationPipe } from "src/request/pipe/request.validation.pipe";
import { Response } from "src/response/response.decorator";
import { IResponse } from "src/response/response.interface";
import { AuthJwtGuard } from "../auth/auth.decorator";
import { ENUM_PERMISSIONS } from "../permission/permission.constant";
import { ENUM_POINTLADDER_STATUS_CODE_ERROR } from "./pointladder.constant";
import { PointLadderService } from "./pointladder.service";
import { PointLadderCreateValidation } from "./validation/pointladder.create.validate";

@Controller('/pointladder')
export class PointLadderController {
    constructor(
        private readonly pointLadderService: PointLadderService,
    ) {}
    @Response('pointladder.create')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ, ENUM_PERMISSIONS.ROLE_CREATE)
    @Post('/create')
    async create(
        @Body(RequestValidationPipe) data: PointLadderCreateValidation
    ): Promise<IResponse> {
        const checkPatientExit = await this.pointLadderService.checkExitPatient(data.patient_id)        
        if (!checkPatientExit) {
            const create = await this.pointLadderService.create(data);
            return {
                _id: create._id
            };
        }
        await this.pointLadderService.update(data)
        
        return {
            _id: checkPatientExit._id
        }
    }

    @Response('pointladder.findOneByIdPatient')
    // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
    @Get('/detail/:_id')
    async findOneById(@Param('_id') _id: string): Promise<IResponse> {
        const pointladder = await this.pointLadderService.findOneByIdPatient(_id);

        if (pointladder) {
            return pointladder;
        } else {
            throw new BadRequestException({
                statusCode:
                    ENUM_POINTLADDER_STATUS_CODE_ERROR.POINTLADDER_NOT_FOUND_ERROR,
                message: 'pointladder.error.notFound'
            });
        }
    }
}