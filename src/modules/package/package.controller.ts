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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StandardPriceService } from '../standard-price/standard-price.service';
import { Package } from './entities/package.entity';

@ApiTags('packages')
@Controller('package')
export class PackageController {
  constructor(
    private readonly packageService: PackageService,
    private readonly stdPriceService: StandardPriceService,
  ) {}

  @Auth(UserType.ADMIN)
  @ApiOperation({ summary: 'Create a package' })
  @Post()
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packageService.create(createPackageDto);
  }

  @ApiOperation({ summary: 'Get all packages' })
  @Get()
  findAll(): Promise<Package[]> {
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
