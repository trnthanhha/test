import { IsString, IsIn, IsNotEmpty, IsObject, IsArray, IsEmpty, IsOptional } from 'class-validator';

export class CreateMedicalHistoryDto {
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    patientId: string;

    @IsNotEmpty()
    @IsArray()
    symptoms: []

    @IsNotEmpty()
    @IsArray()
    regions: []

    @IsNotEmpty()
    @IsArray()
    types: []

    @IsNotEmpty()
    @IsArray()
    distributions: [ ]

    @IsNotEmpty()
    @IsArray()
    symmetrys: [ ]

    @IsNotEmpty()
    @IsArray()
    evolveds: []

    @IsNotEmpty()
    @IsObject()
    others: []
}