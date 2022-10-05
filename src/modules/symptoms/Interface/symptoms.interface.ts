import { UserEntity } from 'src/modules/user/user.schema';
import { Document } from 'mongoose';
import { IRoleDocument } from 'src/modules/role/role.interface';
import { Symptom } from '../Schema/symptom.schema';

export type SymptomsDocument = Symptom & Document;

export interface ICreateSymptoms{
    patientId: string;
    symptoms: [];
}

