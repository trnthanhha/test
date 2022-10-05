import { Document } from "mongoose";
import { EducationEntity } from "./education.schema";

export type EducationDocument = EducationEntity & Document

export type IEducationDocument = EducationDocument

export interface IEducationCreate {
    name: string
}

export type IEducationUpdate = IEducationCreate
