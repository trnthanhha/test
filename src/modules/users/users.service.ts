import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, ILike, Repository, UpdateResult } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { User } from './entities/user.entity';
import { hashPassword } from '../../utils/password';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserType } from './users.constants';
import { DefaultMaxLimit } from '../../constants/db';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly i18n: I18nService,
  ) {}

  async findOne(req: User, lang: string): Promise<User> {
    const user: User = await this.userRepository.findOneBy({ ...req });

    if (!user) {
      const message: string = await this.i18n.t('user.notFound', { lang });

      throw new NotFoundException(message);
    }

    return user;
  }

  findByID(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  searchCustomers(username: string, page?: number, limit?: number) {
    if (!username) {
      throw new BadRequestException();
    }
    const options = {
      order: {
        id: 'ASC',
      },
      where: {
        type: UserType.CUSTOMER,
        username: ILike(`%${username}%`),
      },
    } as FindManyOptions<User>;

    if (!limit || limit > DefaultMaxLimit) {
      limit = DefaultMaxLimit;
    }

    if (page > 0) {
      options.skip = (page - 1) * limit;
    }

    return this.userRepository.find(options);
  }

  //biz
  async resetPassword(id: number, password: string): Promise<boolean> {
    const update: UpdateResult = await this.userRepository.update(id, {
      password: hashPassword(password),
    });

    return update.affected === 1;
  }

  async createBySignUp(registerDto: RegisterDto, lang: string): Promise<User> {
    const { password, full_name, locamos_access_token } = registerDto;
    const username: string = registerDto.username.replace('+', '');

    const findUserByPhone: User = await this.userRepository.findOne({
      where: { username },
    });

    if (findUserByPhone) {
      const message: string = await this.i18n.t('user.username.existed', {
        lang,
      });
      throw new BadRequestException(message);
    }

    const nUser: User = new User();

    const hashedPwd = hashPassword(password);
    nUser.username = username;
    nUser.full_name = full_name;
    nUser.password = hashedPwd;
    nUser.locamos_access_token = locamos_access_token;
    nUser.type = UserType.CUSTOMER;

    return this.userRepository.save(nUser);
  }

  // no use repo
  async updateToken(
    id: number,
    refreshToken: string,
    locamosToken?: string,
  ): Promise<UpdateResult> {
    const modified: QueryDeepPartialEntity<User> = {
      refresh_token: refreshToken,
    };
    if (locamosToken) {
      modified.locamos_access_token = locamosToken;
    }

    return await this.userRepository.update({ id }, modified);
  }

  async listUser(
    page: number,
    limit: number,
    type?: UserType,
    search?: string,
  ) {
    const whereCondition: FindManyOptions<User> = {
      skip: (page - 1) * limit,
      take: limit,
    };

    if (type) {
      whereCondition.where = {
        type: type,
      };
    }

    if (search) {
      whereCondition.where = {
        username: ILike(`%${search}%`),
      };
    }

    const [users, total] = await this.userRepository.findAndCount(
      whereCondition,
    );

    return {
      data: users,
      meta: {
        page_size: limit,
        total_page: Math.ceil(total / limit),
        total_records: total,
      },
    };
  }

  async createUser(data: CreateUserDto) {
    return await this.userRepository.save({
      username: data.username,
      full_name: data.full_name,
      password: hashPassword(data.password),
      type: UserType.ADMIN,
    } as User);
  }

  async updateUser(id: number, data: UpdateUserDto) {
    //todo
    const user = await this.userRepository.findOne({ where: { id } });

    Object.keys(data).forEach((k) => (user[k] = data[k]));

    if (data.password) {
      user.password = hashPassword(data.password);
    }

    await this.userRepository.save(user);

    return user;
  }

  async deleteUser(id: number) {
    const result = await this.userRepository.delete(id);

    return result;
  }
}
