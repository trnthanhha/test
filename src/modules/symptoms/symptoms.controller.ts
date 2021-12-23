import { Controller, Get, Post, Body, Put, Param, Delete, Req, Logger, BadRequestException, InternalServerErrorException, Query } from '@nestjs/common';
import { Response } from 'src/response/response.decorator';
import { ICreateSymptoms } from './Interface/symptoms.interface';
import { SymptomsService } from './symptoms.service';
import { CreateSymptomValidation } from './validation/create-symptom.validation';
import { UpdateSymptomDto } from './validation/update-symptom.dto';
import { PatientService } from '../patient/patient.service';
import { IErrors } from 'src/error/error.interface';
import { RequestValidationPipe } from 'src/request/pipe/request.validation.pipe';
import { ENUM_SYMPTOM_STATUS_CODE_ERROR } from './symptoms.constant';
import { ENUM_STATUS_CODE_ERROR } from 'src/error/error.constant';
@Controller('symptoms')
export class SymptomsController {
  constructor(
    private readonly symptomsService: SymptomsService,
    private readonly patientService: PatientService
  ) { }

  @Response('symptoms.create')
  // @AuthJwtGuard(ENUM_PERMISSIONS.ROLE_READ)
  @Post(":patientId")
  async create(
    @Param('patientId') patientId: string,
    @Body(RequestValidationPipe)
    data: CreateSymptomValidation
  ) {

    const checkExist: IErrors[] = await this.patientService.checkExistById(patientId);

    if (checkExist.length > 0) {
      throw new BadRequestException({
        statusCode: ENUM_SYMPTOM_STATUS_CODE_ERROR.SYMPTOM_NOT_FOUND_ERROR,
        message: 'symptoms.error.createError',
      });
    }

    try {
      data.patientId = patientId;
      const create = await this.symptomsService.create(data);
      return {
        _id: patientId
      }
    } catch (error) {
      throw new InternalServerErrorException({
        error,
        statusCode: ENUM_STATUS_CODE_ERROR.UNKNOWN_ERROR,
        message: 'http.serverError.internalServerError'
      });
    }
  }

  @Get()
  findAll() {
    return this.symptomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // return this.symptomsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSymptomDto: UpdateSymptomDto) {
    return this.symptomsService.update(+id, updateSymptomDto);
  }

  @Delete(':patientId')
  async remove(@Param('patientId') patientId: string, @Query('symptom') symptom: string ) {
    try {
      const remove = await this.symptomsService.remove(patientId, symptom);
      console.log(remove);
      if(remove.nModified !== 0){
        return await this.symptomsService.findOneByPatientId(patientId);
      }else{
        throw new BadRequestException({
          statusCode: ENUM_SYMPTOM_STATUS_CODE_ERROR.SYMPTOM_NOT_FOUND_ERROR,
          message: 'symptoms.error.deleteError',
        });
      }
    } catch (error) {
      throw new InternalServerErrorException({
        error,
        statusCode: ENUM_STATUS_CODE_ERROR.UNKNOWN_ERROR,
        message: 'http.serverError.internalServerError'
      });

    }
  }
}
