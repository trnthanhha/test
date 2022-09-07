import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetAuthUser = () => {
  return createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.user;
  })();
};
