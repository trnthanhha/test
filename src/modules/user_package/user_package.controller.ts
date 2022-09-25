import { Controller, Get, Param } from '@nestjs/common';
import { UserPackageService } from './user_package.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('user packages')
@Controller('user-package')
export class UserPackageController {
  constructor(private readonly userPackageService: UserPackageService) {}
  @Get()
  findAll() {
    return this.userPackageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userPackageService.findOne(+id);
  }
}
