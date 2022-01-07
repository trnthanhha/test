import { Body, Controller, InternalServerErrorException, Post } from "@nestjs/common";
import { ENUM_STATUS_CODE_ERROR } from "src/error/error.constant";
import { RequestValidationPipe } from "src/request/pipe/request.validation.pipe";
import { Response } from "src/response/response.decorator";
import { IResponse } from "src/response/response.interface";
import { AuthJwtGuard } from "../auth/auth.decorator";
import { ENUM_PERMISSIONS } from "../permission/permission.constant";
import { PointLadderService } from "./pointladder.service";
import { PointLadderCreateValidation } from "./validation/pointladder.create";

@Controller('/examrecord')
export class PointLadderController {
    constructor(
        private readonly examRecordService: PointLadderService,
    ) {}
}