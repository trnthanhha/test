import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { decodeUserFromHeader } from '../helper/authorization';

export const GetAuthUser = () => {
  return createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (request.user) {
      return request.user;
    }

    // in case some API does not need auth but still want to detect who is trying to access data?
    try {
      return decodeUserFromHeader(request.headers);
    } catch (_) {
      return;
    }
  })();
};
