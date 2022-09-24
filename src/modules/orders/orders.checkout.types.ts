import { Location } from '../locations/entities/location.entity';
import { Package } from '../package/entities/package.entity';
import { StandardPrice } from '../standard-price/entities/standard-price.entity';

export type PrepareOrder = {
  location: Location;
  pkg: Package;
  stdPrice: StandardPrice;
};
