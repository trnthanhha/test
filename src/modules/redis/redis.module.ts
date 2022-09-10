import { Module } from '@nestjs/common';
import { createClient } from 'redis';
import { REDIS_CLIENT_PROVIDER, REDIS_TOKEN_PROVIDER } from './redis.constants';

@Module({
  providers: [
    {
      provide: REDIS_TOKEN_PROVIDER,
      useValue: {
        url: 'redis://localhost:6379',
      },
    },
    {
      inject: [REDIS_TOKEN_PROVIDER],
      provide: REDIS_CLIENT_PROVIDER,
      useFactory: async (options: { url: string }) => {
        const client = createClient(options);
        await client.connect();
        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT_PROVIDER],
})
export class RedisModule {}
