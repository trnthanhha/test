import { Injectable } from '@nestjs/common';
import { Bill } from './entities/bill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
  ) {}
  create(bill: Bill, dbManager?: EntityManager): Promise<Bill> {
    const repo = dbManager?.getRepository(Bill) || this.billRepository;
    return repo.save(bill);
  }

  update(bill: Bill, dbManager?: EntityManager): Promise<UpdateResult> {
    const repo = dbManager?.getRepository(Bill) || this.billRepository;
    return repo.update(
      {
        id: bill.id,
        version: bill.version,
      },
      Object.assign(bill, { version: bill.version + 1 }),
    );
  }

  findAll() {
    return `This action returns all bills`;
  }

  async findOneByRefID(ref_id: string): Promise<Bill> {
    return await this.billRepository.findOne({
      where: {
        ref_id,
      },
      relations: {
        order: true,
      },
    });
  }
}
