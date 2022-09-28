import { PartialType } from '@nestjs/swagger';
import { CreateJobRegisterDto } from './create-job-register.dto';

export class UpdateJobRegisterDto extends PartialType(CreateJobRegisterDto) {}
