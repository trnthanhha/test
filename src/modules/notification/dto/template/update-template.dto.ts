import { PartialType } from '@nestjs/swagger';
import { CreateNoticeTemplateDto } from './create-template.dto';

export class UpdateTemplateDto extends PartialType(CreateNoticeTemplateDto) {}
