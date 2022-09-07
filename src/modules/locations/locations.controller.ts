import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationsService.create(createLocationDto);
  }

  @ApiOperation({
    summary: 'Get all locations by page',
  })
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    let nLimit = +limit;
    if (!nLimit || nLimit > 200) {
      nLimit = 50;
    }

    let nPage = +page;
    if (!nPage || nPage <= 0) {
      nPage = 1;
    }
    return this.locationsService.findAll(nPage, nLimit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationsService.findOne(+id);
  }
  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateLocationDto: UpdateLocationDto,
  // ) {
  //   return this.locationsService.update(+id, updateLocationDto);
  // }
}
