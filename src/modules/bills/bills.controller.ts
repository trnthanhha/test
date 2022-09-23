import { Controller, Get } from '@nestjs/common';
import { BillsService } from './bills.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('bills')
@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  findAll() {
    return this.billsService.findAll();
  }
}
