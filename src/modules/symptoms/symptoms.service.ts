import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Helper } from 'src/helper/helper.decorator';
import { HelperService } from 'src/helper/helper.service';
import { Message } from 'src/message/message.decorator';
import { MessageService } from 'src/message/message.service';
import { ICreateSymptoms, SymptomsDocument } from './Interface/symptoms.interface';
import symptoms from './message/symptom';
import { Symptom } from './Schema/symptom.schema';
import { CreateSymptomValidation } from './validation/create-symptom.validation';
import { UpdateSymptomDto } from './validation/update-symptom.dto';

@Injectable()
export class SymptomsService {
  constructor(
    @InjectModel(Symptom.name)
    private readonly symptomModel: Model<SymptomsDocument>,
    @Helper() private readonly helperService: HelperService,
    @Message() private readonly messageService: MessageService
  ) { }
  async create(symptom: ICreateSymptoms): Promise<SymptomsDocument> {

    const symptomByPatientId: SymptomsDocument = await this.findOneByPatientId(symptom.patientId)

    if (symptomByPatientId) {
      const patientId = symptom.patientId;
      const symptoms = symptom.symptoms
      return await this.symptomModel.updateOne(
        { patientId },
        {
          $set: {
            symptoms
          }
        })
    }
    const create: SymptomsDocument = await new this.symptomModel(symptom);

    return create.save();
  }

  findAll() {
    return `This action returns all symptoms`;
  }

  findOneByPatientId(patientId: string) {
    return this.symptomModel.findOne({ patientId });
  }

  update(id: number, updateSymptomDto: UpdateSymptomDto) {
    return `This action updates a #${id} symptom`;
  }

  async remove(patientId: string, symptom: string) {
    return await this.symptomModel.updateOne(
      { 'patientId': patientId },
      { $pull: { symptoms: { symptom } } },
      { multi: true }
    );
  }
}
