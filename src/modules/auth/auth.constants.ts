import 'dotenv/config';

export const jwtConstants = {
  secret: process.env.JWT_KEY,
};

export const LocaMosEndpoint = {
  Login: '/login',
  Profile: '/me',
  BuyPackage: '/bid/buy/package',
};
