import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { UserType } from './users.constants';
import { NotFoundException } from '@nestjs/common';
import {
  REDIS_CLIENT_PROVIDER,
  REDIS_TOKEN_PROVIDER,
} from '../redis/redis.constants';

describe('UsersController', () => {
  it('get profile, hidden password, ignore find admin if customer', async () => {
    const redisMock = jest.fn(() => ({
      incr: jest.fn(() => 1),
      expire: jest.fn(() => true),
    }));
    const model = getExampleUser();

    const censored = {
      username: model.username,
      identification_number: model.identification_number,
      identification_created_at: model.identification_created_at,
    } as User;

    const repoMock: jest.Mock<any, []> = jest.fn(() => ({
      findOneBy: jest.fn(() => model),
    }));
    const controller = await getController(repoMock, redisMock);

    await expect(
      controller.getProfile('1', { id: 1 } as User),
    ).resolves.toEqual(censored);

    model.type = UserType.ADMIN;
    await expect(
      controller.getProfile('1', { id: 1, type: UserType.CUSTOMER } as User),
    ).rejects.toEqual(new NotFoundException());
    await expect(
      controller.getProfile('1', { id: 1, type: UserType.ADMIN } as User),
    ).resolves.toEqual(censored);
  });

  it('get profile, reach limited access', async () => {
    const redisMock = jest.fn(() => ({
      incr: jest.fn(() => 11),
      expire: jest.fn(() => true),
    }));
    const controller = await getController(
      jest.fn(() => ({
        findOneBy: jest.fn(() => {
          return;
        }),
      })),
      redisMock,
    );
    await expect(controller.getProfile('1', { id: 1 } as User)).rejects.toEqual(
      new Error('Too many requests'),
    );
  });
});

async function getController(mockRepo, mockRedis = jest.fn(() => ({}))) {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      I18nModule.forRoot({
        fallbackLanguage: 'en',
        loaderOptions: {
          path: 'src/i18n',
          watch: true,
        },
        resolvers: [
          { use: QueryResolver, options: ['lang'] },
          AcceptLanguageResolver,
        ],
      }),
    ],
    controllers: [UsersController],
    providers: [
      UsersService,
      {
        provide: getRepositoryToken(User),
        useFactory: mockRepo,
      },
      {
        provide: REDIS_TOKEN_PROVIDER,
        useFactory: mockRedis,
      },
      {
        provide: REDIS_CLIENT_PROVIDER,
        useFactory: mockRedis,
      },
    ],
  }).compile();

  return module.get<UsersController>(UsersController);
}

function getExampleUser() {
  const model = new User();
  model.username = 'admin';
  model.password = 'hashed';
  model.type = UserType.CUSTOMER;
  model.identification_number = '123-ident-number';
  model.identification_created_at = new Date();
  model.refresh_token = '123-refresh-token';

  return model;
}
