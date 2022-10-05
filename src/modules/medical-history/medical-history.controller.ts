import { Controller, Get, Post, Body, Put, Param, Delete, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ENUM_STATUS_CODE_ERROR } from 'src/error/error.constant';
import { IErrors } from 'src/error/error.interface';
import { RequestValidationPipe } from 'src/request/pipe/request.validation.pipe';
import { Response } from 'src/response/response.decorator';
import { IResponse } from 'src/response/response.interface';
import { AuthJwtGuard } from '../auth/auth.decorator';
import { PatientService } from '../patient/patient.service';
import { ENUM_PERMISSIONS } from '../permission/permission.constant';
import { ENUM_MEDICAL_HISTORY_STATUS_CODE_ERROR } from './medical-history.constant';
import { MedicalHistoryService } from './medical-history.service';
import { CreateMedicalHistoryDto } from './validation/create-medical-history.validation';
import { UpdateMedicalHistoryDto } from './validation/update-medical-history.validation';

@Controller('medical-history')
export class MedicalHistoryController {
  constructor(
    private readonly medicalHistoryService: MedicalHistoryService,
    private readonly patientService: PatientService
    ) {}

  @Response('medical_history.create')
  @AuthJwtGuard(ENUM_PERMISSIONS.USER_READ)
  @Post(':patientId')
  async create(
    @Param('patientId') patientId: string,
    @Body(RequestValidationPipe)
    data: CreateMedicalHistoryDto
  ): Promise<IResponse> {
    const checkExist: IErrors[] = await this.patientService.checkExistById(patientId);

    if (checkExist.length > 0) {
      throw new BadRequestException({
        statusCode: ENUM_MEDICAL_HISTORY_STATUS_CODE_ERROR.MEDICAL_HISTORY_EXISTS_ERROR,
        message: 'medical_history.error.notFoundPatient',
      });
    }

    try {
      data.patientId = patientId;
      const create = await this.medicalHistoryService.create(data);
      if(create.nModified == 1){
        return {
          patientId: patientId,
          type: "update"
        }
      }
      
      return {
        patientId: patientId,
        type: "create"
      }
    } catch (error) {
      Logger.log(error)
      throw new InternalServerErrorException({
        error,
        statusCode: ENUM_STATUS_CODE_ERROR.UNKNOWN_ERROR,
        message: 'http.serverError.internalServerError'
      });
    }
  }

  @Get()
  findAll() {
    return this.medicalHistoryService.findAll();
  }

  
  @Put(':id')
  update(@Param('id') id: string, @Body() updateMedicalHistoryDto: UpdateMedicalHistoryDto) {
    return this.medicalHistoryService.update(+id, updateMedicalHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalHistoryService.remove(+id);
  }
}
