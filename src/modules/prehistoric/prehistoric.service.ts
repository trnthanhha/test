import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Helper } from 'src/helper/helper.decorator';
import { HelperService } from 'src/helper/helper.service';
import { Message } from 'src/message/message.decorator';
import { MessageService } from 'src/message/message.service';
import { PrehistoricDocument } from './interface/prehistoric.interface';
import { Prehistoric } from './Schema/prehistoric.schema';
import { CreatePrehistoricValidation } from './validation/create-prehistoric.validation';
import { UpdatePrehistoricDto } from './validation/update-prehistoric.dto';

@Injectable()
export class PrehistoricService {
  constructor(
    @InjectModel(Prehistoric.name)
    private readonly prehistoricModel: Model<PrehistoricDocument>,
    @Helper() private readonly helperService: HelperService,
    @Message() private readonly messageService: MessageService
  ) { }

  async create(prehistoric: CreatePrehistoricValidation) {
    const prehistoricByPatientId: PrehistoricDocument = await this.findOneByPatientId(prehistoric.patientId)

    if (prehistoricByPatientId) {
      const patientId = prehistoric.patientId;
      return await this.prehistoricModel.updateOne(
        { patientId },
        {...prehistoric}
      )
    }

    const create: PrehistoricDocument = await new this.prehistoricModel(prehistoric);
    return create.save();

  }

  findAll() {
    return `This action returns all prehistoric`;
  }

  async findOneByPatientId(patientId: string) {
    return await this.prehistoricModel.findOne({ patientId })
  }

  update(id: number, updatePrehistoricDto: UpdatePrehistoricDto) {
    return `This action updates a #${id} prehistoric`;
  }

  remove(id: number) {
    return `This action removes a #${id} prehistoric`;
  }
}
