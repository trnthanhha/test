export class CheckoutDto {
  public static success = (redirect_url: string): CheckoutDto => {
    const rs = new CheckoutDto();
    rs.redirect_url = redirect_url;
    rs.success = true;

    return rs;
  };

  public static fail = (ex, message): CheckoutDto => {
    const rs = new CheckoutDto();

    rs.error = ex;
    rs.message = message;

    return rs;
  };

  success: boolean;
  error: any;
  message: string;
  redirect_url: string;
}
