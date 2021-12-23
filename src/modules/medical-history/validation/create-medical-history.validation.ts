import { IsString, IsIn, IsNotEmpty, IsObject, IsArray } from 'class-validator';

export class CreateMedicalHistoryDto {
    @IsNotEmpty()
    @IsString()
    patientId: string;

    @IsNotEmpty()
    @IsArray()
    symptoms: []

    @IsNotEmpty()
    @IsArray()
    regions: [ ]

    @IsNotEmpty()
    @IsArray()
    types: [ ]

    @IsNotEmpty()
    @IsArray()
    distributions: [ ]

    @IsNotEmpty()
    @IsArray()
    symmetrys: [ ]

    @IsNotEmpty()
    @IsArray()
    evolveds: [ ]

    @IsNotEmpty()
    @IsString()
    others: []
}