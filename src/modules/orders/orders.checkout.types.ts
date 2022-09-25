import { Location } from '../locations/entities/location.entity';
import { Package } from '../package/entities/package.entity';
import { StandardPrice } from '../standard-price/entities/standard-price.entity';
import { UserPackage } from '../user_package/entities/user_package.entity';

export type PrepareOrder = {
  location: Location;
  pkg?: Package;
  userPkg?: UserPackage;
  stdPrice?: StandardPrice;
};
