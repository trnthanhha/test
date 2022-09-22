import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserPackageService } from './user_package.service';
import { CreateUserPackageDto } from './dto/create-user_package.dto';
import { UpdateUserPackageDto } from './dto/update-user_package.dto';

@Controller('user-package')
export class UserPackageController {
  constructor(private readonly userPackageService: UserPackageService) {}

  @Post()
  create(@Body() createUserPackageDto: CreateUserPackageDto) {
    return this.userPackageService.create(createUserPackageDto);
  }

  @Get()
  findAll() {
    return this.userPackageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userPackageService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserPackageDto: UpdateUserPackageDto) {
    return this.userPackageService.update(+id, updateUserPackageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userPackageService.remove(+id);
  }
}
