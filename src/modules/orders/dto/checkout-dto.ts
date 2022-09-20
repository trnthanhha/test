export class CheckoutDto {
  public static success = () => {
    const rs = new CheckoutDto();
  };

  constructor(error, message) {
    if (!error) {
      this.success = true;
    }
    this.error = error;
    this.message = message;
  }

  success: boolean;
  error: any;
  message: string;
  redirect_url: string;
}
