import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Bill } from './entities/bill.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class BillsService {
  constructor(
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
  ) {}
  create(bill: Bill, txManager?: EntityManager): Promise<Bill> {
    const repo = txManager?.getRepository(Bill) || this.billRepository;
    return repo.save(bill);
  }

  async update(bill: Bill, txManager?: EntityManager): Promise<UpdateResult> {
    const repo = txManager?.getRepository(Bill) || this.billRepository;
    const updateResult = await repo.update(
      {
        id: bill.id,
        version: bill.version,
      },
      Object.assign(bill, { version: bill.version + 1 }),
    );
    if (!updateResult.affected) {
      throw new InternalServerErrorException(
        `Bill was changed, id: ${bill.id}`,
      );
    }

    return updateResult;
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
