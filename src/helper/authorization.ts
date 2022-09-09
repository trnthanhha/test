import { ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const decodeUserFromHeader = (headers) => {
  const bearer = headers?.authorization;
  if (!bearer) {
    throw new ForbiddenException();
  }
  const payload = bearer.substring('Bearer '.length);
  return new JwtService().decode(payload, { json: true });
};
