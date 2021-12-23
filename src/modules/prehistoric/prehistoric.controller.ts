import { Controller, Get, Post, Body, Put, Param, Delete, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ENUM_STATUS_CODE_ERROR } from 'src/error/error.constant';
import { SuccessException } from 'src/error/error.http.filter';
import { IErrors } from 'src/error/error.interface';
import { RequestValidationPipe } from 'src/request/pipe/request.validation.pipe';
import { Response } from 'src/response/response.decorator';
import { AuthJwtGuard } from '../auth/auth.decorator';
import { PatientService } from '../patient/patient.service';
import { ENUM_PERMISSIONS } from '../permission/permission.constant';
import { ENUM_SYMPTOM_STATUS_CODE_ERROR } from '../symptoms/symptoms.constant';
import { CreateSymptomValidation } from '../symptoms/validation/create-symptom.validation';
import { PrehistoricService } from './prehistoric.service';
import { CreatePrehistoricValidation } from './validation/create-prehistoric.validation';
import { UpdatePrehistoricDto } from './validation/update-prehistoric.dto';

@Controller('prehistoric')
export class PrehistoricController {
  constructor(
    private readonly prehistoricService: PrehistoricService,
    private readonly patientService: PatientService
  ) { }

  @Response('prehistoric.create')
  @AuthJwtGuard(ENUM_PERMISSIONS.USER_READ)
  @Post(":patientId")
  async create(
    @Param('patientId') patientId: string,
    @Body(RequestValidationPipe)
    data: CreatePrehistoricValidation
  ) {
    const checkExist: IErrors[] = await this.patientService.checkExistById(patientId);

    if (checkExist.length > 0) {
      throw new BadRequestException({
        statusCode: ENUM_SYMPTOM_STATUS_CODE_ERROR.SYMPTOM_NOT_FOUND_ERROR,
        message: 'prehistoric.error.notFoundPatient',
      });
    }

    try {
      data.patientId = patientId;
      const create = await this.prehistoricService.create(data);
      
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
      throw new InternalServerErrorException({
        error,
        statusCode: ENUM_STATUS_CODE_ERROR.UNKNOWN_ERROR,
        message: 'http.serverError.internalServerError'
      });
    }
  }
 
 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prehistoricService.remove(+id);
  }
}
