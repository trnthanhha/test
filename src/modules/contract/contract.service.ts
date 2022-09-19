import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ContractEntity } from "./entities/contract.entity";


@Injectable()
export class ContractService {
    constructor(@InjectRepository(ContractEntity) contract: Repository<ContractEntity>) {}

    createContract() {}

    getContract() {}
}