import { Document } from "mongoose";
import { TypeBaseEntity } from "./typebase.schema";

export type TypeBaseDocument = TypeBaseEntity & Document

export type ITypeBaseDocument = TypeBaseDocument

export interface ITypeBaseCreate {
    name: string
}

export type ITypeBaseUpdate = ITypeBaseCreate
