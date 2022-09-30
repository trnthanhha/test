import { Location } from '../../locations/entities/location.entity';
import { UserPackage } from '../../user_package/entities/user_package.entity';

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
