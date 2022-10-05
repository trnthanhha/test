import { Document } from "mongoose";
import { PointLadderEntity } from "./pointladder.schema";

export type PointLadderDocument = PointLadderEntity & Document

export type IPointLadderDocument = PointLadderDocument

export type IPointLadderCreate = Omit<PointLadderEntity, 'options'>
