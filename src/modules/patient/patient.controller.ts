import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
    Query
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { PaginationService } from 'src/pagination/pagination.service';;
import { IResponse, IResponsePaging } from 'src/response/response.interface';
import { Logger as DebuggerService } from 'winston';
import { Debugger } from 'src/debugger/debugger.decorator';

@Controller('/patient')
export class PatientController {
    constructor(
        @Debugger() private readonly debuggerService: DebuggerService,
        private readonly paginationService: PaginationService,
        private readonly patientService: PatientService
    ) {}
}
