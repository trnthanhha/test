import { PartialType } from '@nestjs/swagger';
import { CreateUserPackageDto } from './create-user_package.dto';

export class UpdateUserPackageDto extends PartialType(CreateUserPackageDto) {}
