import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../locations/entities/location.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contract } from './entities/contract.entity';
import { User } from '../users/entities/user.entity';
@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract) private readonly contract: Repository<Contract>,
    @InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(Location) private readonly location: Repository<Location>,
  ) {}

  async createContract(data: CreateContractDto) {
    const [location, buyer, owner] = await Promise.all([
      this.location.findOne({ where: { id: data.location_id } }),
      this.user.findOne({ where: { id: data.buyer_id } }),
      this.user.findOne({ where: { id: data.owner_id } }),
    ]);

    if (!location || !buyer || !owner) throw new Error('Bad Request');

    return this.contract.save(data);
  }

  async getContractById(id: number) {
    const contract = await this.contract.findOne({
      where: {
        id: id,
      },
    });

    const [location, buyer, owner] = await Promise.all([
      this.location.findOne({ where: { id: contract.location_id } }),
      this.user.findOne({ where: { id: contract.buyer_id } }),
      this.user.findOne({ where: { id: contract.owner_id } }),
    ]);

    return {
      location,
      buyer,
      owner,
    };
  }

  async updateContract(id: number, data: UpdateContractDto) {
    const [location, buyer, owner] = await Promise.all([
      this.location.findOne({ where: { id: data.location_id } }),
      this.user.findOne({ where: { id: data.buyer_id } }),
      this.user.findOne({ where: { id: data.owner_id } }),
    ]);

    if (!location || !buyer || !owner) throw new Error('Bad Request');

    const contract = await this.contract.findOne({ where: { id } });

    Object.keys(data).forEach((v) => (contract[v] = data[v]));

    return this.contract.save(contract);
  }
}
