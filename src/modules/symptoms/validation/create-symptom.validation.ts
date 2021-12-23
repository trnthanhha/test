import { IsNotEmpty, IsObject, IsString } from "class-validator";

export class CreateSymptomValidation {
    @IsNotEmpty()
    @IsString()
    patientId: string;

    @IsNotEmpty()
    symptoms: [];
}
