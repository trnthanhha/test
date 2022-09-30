import { Injectable, NotFoundException } from '@nestjs/common';
import { TransactionInfo } from '../orders/vendor_adapters/payment.types';
import { BillsService } from '../bills/bills.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPackage } from '../user_package/entities/user_package.entity';
import { PackageTransactionInfo } from '../../services/locamos-linkage/transaction.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ConsumersService {
  constructor(
    private readonly billsService: BillsService,
    @InjectRepository(UserPackage)
    private userPackageRepository: Repository<UserPackage>,
  ) {}

  async prepareDataForLocaMos(info: TransactionInfo) {
    const bill = await this.billsService.findOneByRefID(info.uuid);
    if (!bill || !bill.order?.user_package_id) {
      throw new NotFoundException();
    }
    const userPkg = await this.userPackageRepository.findOne({
      where: {
        id: bill.order.user_package_id,
      },
      relations: {
        owner: true,
      },
    });
    if (!userPkg) {
      throw new NotFoundException();
    }

    return {
      txInfo: {
        nft_address: this.getDraftAddress(userPkg),
        package_id: userPkg.ref_id,
        seq_id: bill.ref_id,
      } as PackageTransactionInfo,
      owner: userPkg.owner as User,
    };
  }

  getDraftAddress(userPkg: UserPackage): string[] {
    const list = [];
    for (let i = 0; i < userPkg.quantity; i++) {
      if (userPkg.owner instanceof User) {
        list.push(
          `${userPkg.owner.username}_${userPkg.owner.phone_number || ''}_${
            i + 1
          }`,
        );
      }
    }

    return list;
  }
}
