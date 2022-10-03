import { Location } from '../../locations/entities/location.entity';
import { UserPackage } from '../../user_package/entities/user_package.entity';

export class CheckoutBillAddress {
  phone_number: string;
  identification_number: string;
  identification_created_at: Date;
  identification_created_from: string;
  province: string;
  district: string;
  address: string;

  constructor(obj: any) {
    this.phone_number = obj.phone_number;
    this.identification_number = obj.identification_number;
    if (typeof obj.identification_created_at === 'string') {
      this.identification_created_at = new Date(obj.identification_created_at);
    } else {
      this.identification_created_at = obj.identification_created_at;
    }
    this.identification_created_from = obj.identification_created_from;
    this.province = obj.province;
    this.district = obj.district;
    this.address = obj.address;
  }

  static isEmpty(obj: any) {
    return (
      !obj.phone_number &&
      !obj.identification_number &&
      !obj.identification_created_at &&
      !obj.identification_created_from &&
      !obj.province &&
      !obj.district &&
      !obj.address
    );
  }
  isEqualTo(dest: CheckoutBillAddress): boolean {
    return JSON.stringify(this) === JSON.stringify(dest);
  }
}

export class CheckoutDto {
  public static success = (
    redirect_url?: string,
    newItem?: Location | UserPackage,
  ): CheckoutDto => {
    const rs = new CheckoutDto();
    rs.redirect_url = redirect_url;
    rs.success = true;
    if (newItem instanceof Location) {
      rs.location = newItem;
      rs.location_name = newItem.name;
    } else {
      rs.user_package = newItem;
      rs.package_name = newItem?.package_name;
    }

    return rs;
  };

  public static fail = (ex, message): CheckoutDto => {
    const rs = new CheckoutDto();

    rs.error = ex;
    rs.message = message;

    return rs;
  };

  success: boolean;
  error?: any;
  message?: string;
  redirect_url?: string;
  location_name?: string;
  package_name?: string;
  location?: Location;
  user_package?: UserPackage;
}
