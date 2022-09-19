import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ContractService } from "./contract.service";



@ApiTags('contract')
@Controller('contract')
export class ContractController {
    constructor(private readonly contractService: ContractService) {}
} 