import 'dotenv/config';

export const jwtConstants = {
  secret: process.env.JWT_KEY,
};

export const LocaMosEndpoint = {
  Login: '/login',
  Profile: '/me',
  BuyPackageByPoint: '/bid/buy/package',
  BuyPackageByOther: '/bid/buy-f/package',
};
