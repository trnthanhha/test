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
import { DoctorService } from './doctor.service';
import { PaginationService } from 'src/pagination/pagination.service';;
import { IResponse, IResponsePaging } from 'src/response/response.interface';
import { Logger as DebuggerService } from 'winston';
import { Debugger } from 'src/debugger/debugger.decorator';

@Controller('/doctor')
export class DoctorController {
    constructor(
        @Debugger() private readonly debuggerService: DebuggerService,
        private readonly paginationService: PaginationService,
        private readonly doctorService: DoctorService
    ) {}
}
