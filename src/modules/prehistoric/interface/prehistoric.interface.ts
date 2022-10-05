import { UserEntity } from 'src/modules/user/user.schema';
import { Document } from 'mongoose';
import { IRoleDocument } from 'src/modules/role/role.interface';
import { Prehistoric } from '../Schema/prehistoric.schema';

export type PrehistoricDocument = Prehistoric & Document;

export interface ICreateprehistoric{
    patientId: string;
    allergys: [];
}

