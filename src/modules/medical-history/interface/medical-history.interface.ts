import { Document } from "mongoose";
import { MedicalHistory } from "../Schema/medical-history.schema";

export type MedicalHistoryDocument = MedicalHistory & Document


export interface ICreateMedicalHistory{
    patientId: string;
    symptoms: []
    regions: [ ]
    types: [ ]
    distributions: [ ]
    symmetrys: [ ]
    evolveds: [ ]
    others: []
}