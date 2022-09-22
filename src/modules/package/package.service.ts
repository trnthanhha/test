import { Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
  ) {}

  create(createPackageDto: CreatePackageDto) {
    const pkg = new Package();
    Object.assign(pkg, createPackageDto);

    return this.packageRepository.save(pkg);
  }

  findAll() {
    return this.packageRepository.find();
  }

  findOne(id: number) {
    return this.packageRepository.findOneBy({ id });
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
