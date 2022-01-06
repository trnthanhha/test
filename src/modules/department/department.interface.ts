import { Document } from "mongoose";
import { DepartmentEntity } from "./department.schema";

export type DepartmentDocument = DepartmentEntity & Document

export type IDepartmentDocument = DepartmentDocument

export interface IDepartmentCreate {
    name: string
}

export type IDepartmentUpdate = IDepartmentCreate
