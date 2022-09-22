import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Auth } from '../../decorators/roles.decorator';
import { UserType } from '../users/users.constants';
import { ApiOperation } from '@nestjs/swagger';

@Controller('package')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Auth(UserType.ADMIN)
  @ApiOperation({ summary: 'Create a package' })
  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packageService.create(createPackageDto);
  }

  @ApiOperation({ summary: 'Get all packages' })
  @Get()
  findAll() {
    return this.packageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packageService.findOne(+id);
  }

  @Auth(UserType.ADMIN)
  @ApiOperation({ summary: 'Update a package' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return this.packageService.update(+id, updatePackageDto);
  }

  @Auth(UserType.ADMIN)
  @ApiOperation({ summary: 'Delete a package' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.packageService.remove(+id);
  }
}
