import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../locations/entities/location.entity';
import { User } from '../users/entities/user.entity';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { Contract } from './entities/contract.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, User, Location])],
  controllers: [ContractController],
  providers: [ContractService],
})
export class ContractModule {}
