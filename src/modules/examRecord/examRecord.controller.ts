import { Body, Controller, InternalServerErrorException, Post } from "@nestjs/common";
import { ENUM_STATUS_CODE_ERROR } from "src/error/error.constant";
import { RequestValidationPipe } from "src/request/pipe/request.validation.pipe";
import { Response } from "src/response/response.decorator";
import { IResponse } from "src/response/response.interface";
import { AuthJwtGuard } from "../auth/auth.decorator";
import { ENUM_PERMISSIONS } from "../permission/permission.constant";
import { ExamRecordService } from "./examRecord.service";
import { ExamRecordCreateValidation } from "./validation/examRecord.create";

@Controller('/examrecord')
export class ExamRecordController {
    constructor(
        private readonly examRecordService: ExamRecordService,
    ) {}
}