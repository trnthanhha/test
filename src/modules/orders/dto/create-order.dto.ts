import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import {  IsNumber, IsString } from "class-validator";
import { Order } from "../entities/order.entity";

export class CreateOrderDto extends PartialType(Order) {
    @ApiProperty({ description: 'price of order', required: true, example: 20000 })
    @IsNumber()
    price: number;

    @ApiProperty({ required: true, example: 123 })
    @IsString()
    location_id: number;
}
