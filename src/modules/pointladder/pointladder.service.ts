import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PointLadderDocument, IPointLadderCreate, IPointLadderDocument } from "./pointladder.interface";
import { PointLadderEntity } from "./pointladder.schema";

@Injectable()
export class PointLadderService{
    constructor(
        @InjectModel(PointLadderEntity.name)
        private readonly examRecorModel: Model<PointLadderDocument>,
    ) {}
}