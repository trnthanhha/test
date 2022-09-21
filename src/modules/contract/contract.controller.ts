import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/decorators/roles.decorator';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contract } from './entities/contract.entity';

@ApiTags('contract')
@Controller('contract')
@UseInterceptors(ClassSerializerInterceptor)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @ApiOperation({ summary: 'get a contract' })
  @ApiOkResponse({
    type: Contract,
  })
  @Auth()
  @Get(':id')
  getContract(@Param('id') id: string) {
    return this.contractService.getContractById(+id);
  }

  @ApiOperation({ summary: 'create a contract info' })
  @ApiOkResponse({
    type: Contract,
  })
  @Auth()
  @Post()
  create(@Body() data: CreateContractDto) {
    return this.contractService.createContract(data);
  }

  @ApiOperation({ summary: 'update a contract info' })
  @ApiOkResponse({
    type: Contract,
  })
  @Auth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateContractDto) {
    return this.contractService.updateContract(+id, data);
  }

  @ApiOperation({ summary: 'delete a contract info' })
  @ApiOkResponse({
    type: Contract,
  })
  @Auth()
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.contractService.deleteContract(+id);
  }
}
