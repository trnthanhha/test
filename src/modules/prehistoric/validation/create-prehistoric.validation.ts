import { IsNotEmpty, IsString } from "class-validator";

export class CreatePrehistoricValidation {
    @IsNotEmpty()
    @IsString()
    patientId: string;

    @IsNotEmpty()
    allergys: [];
 
    @IsNotEmpty()
    surgerys: [];

    @IsNotEmpty()
    disabilities: [];

    @IsNotEmpty()
    use_medicine: [];

    @IsNotEmpty()
    diseases: [];
}
