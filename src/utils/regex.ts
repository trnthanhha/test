/**
 * Regex phone number Vietnam:
 * @link https://gist.github.com/tungvn/2460c5ba947e5cbe6606c5e85249cf04
 */
const regexPhone = /((^(\+84|84|0|0084){1})(3|5|7|8|9))+([0-9]{8})$/;

function checkPhoneNumber(phone: string): boolean {
  return regexPhone.test(phone);
}

export { checkPhoneNumber };
