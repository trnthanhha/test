import { Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StandardPrice } from '../standard-price/entities/standard-price.entity';
import { StandardPriceService } from '../standard-price/standard-price.service';

@Injectable()
export class PackageService {
  constructor(
    private readonly stdPriceService: StandardPriceService,
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
  ) {}

  create(createPackageDto: CreatePackageDto) {
    const pkg = new Package();
    Object.assign(pkg, createPackageDto);

    return this.packageRepository.save(pkg);
  }

  async findAll(): Promise<Package[]> {
    const stdPrice: StandardPrice =
      await this.stdPriceService.getStandardPrice();
    if (!stdPrice || !stdPrice.price) {
      throw new Error('standard price is not configured');
    }
    const packages = await this.packageRepository.find({
      order: {
        id: 'ASC',
      },
    });
    packages.forEach((pkg) => {
      pkg.price = stdPrice.price * pkg.quantity;
    });
    return packages;
  }

  async findOne(id: number) {
    const stdPrice: StandardPrice =
      await this.stdPriceService.getStandardPrice();
    if (!stdPrice || !stdPrice.price) {
      throw new Error('standard price is not configured');
    }
    const pkg = await this.packageRepository.findOneBy({ id });
    if (pkg) {
      pkg.price = stdPrice.price * pkg.quantity;
    }

    return pkg;
  }

  update(id: number, updatePackageDto: UpdatePackageDto) {
    const pkg = Object.assign(new Package(), updatePackageDto);
    return this.packageRepository.update(
      { id, version: pkg.version },
      Object.assign(pkg, { version: pkg.version + 1 }),
    );
  }

  remove(id: number) {
    return this.packageRepository.delete({ id });
  }
}
