import * as crypto from 'crypto';

export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', password).digest('hex');
}
