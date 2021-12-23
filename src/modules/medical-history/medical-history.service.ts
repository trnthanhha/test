import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICreateMedicalHistory, MedicalHistoryDocument } from './interface/medical-history.interface';
import { MedicalHistory } from './Schema/medical-history.schema';
import { CreateMedicalHistoryDto } from './validation/create-medical-history.validation';
import { UpdateMedicalHistoryDto } from './validation/update-medical-history.validation';

@Injectable()
export class MedicalHistoryService {
  constructor(
    @InjectModel(MedicalHistory.name)
    private readonly medicalHistoryModel: Model<MedicalHistoryDocument>,
) {}
  async create(medicalHistory: ICreateMedicalHistory) {
    const symptomByPatientId: MedicalHistoryDocument = await this.findOneByPatientId(medicalHistory.patientId)

    if (symptomByPatientId) {
      const patientId = medicalHistory.patientId;
      return await this.medicalHistoryModel.updateOne(
        { patientId },
        {
          $set: {
            symptoms: medicalHistory.symptoms,
            regions: medicalHistory.regions,
            types: medicalHistory.types,
            distributions: medicalHistory.distributions,
            symmetrys: medicalHistory.symmetrys,
            evolveds: medicalHistory.evolveds,
            others: medicalHistory.others
          }
        })
    }
    const create: MedicalHistoryDocument = await new this.medicalHistoryModel(medicalHistory);

    return create.save();
  }

  findAll() {
    return `This action returns all medicalHistory`;
  }

  findOneByPatientId(patientId: string) {
     return this.medicalHistoryModel.findOne({ patientId });
  }

  update(id: number, updateMedicalHistoryDto: UpdateMedicalHistoryDto) {
    return `This action updates a #${id} medicalHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} medicalHistory`;
  }
}
