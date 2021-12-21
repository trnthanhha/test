import {
    IsString,
    Length
} from 'class-validator';

export class PatientCheckExitValidation {
    @IsString()
    @Length(10)
    readonly phone: string
}
