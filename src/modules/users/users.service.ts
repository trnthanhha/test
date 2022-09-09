import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { User } from './entities/user.entity';
import { hashPassword } from '../../utils/password';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserType } from './users.constants';

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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  //biz
  async resetPassword(id: number, password: string): Promise<boolean> {
    const update: UpdateResult = await this.userRepository.update(id, {
      password: hashPassword(password),
    });

    if (update.affected === 1) {
      return true;
    }

    return false;
  }

  async createBySignUp(registerDto: RegisterDto, lang: string): Promise<User> {
    const { password } = registerDto;
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
    nUser.password = hashedPwd;
    nUser.type = UserType.CUSTOMER;

    return this.userRepository.save(nUser);
  }

  // no use repo
  async updateRefreshToken(
    id: number,
    refreshToken: string,
  ): Promise<UpdateResult> {
    const modified: {
      refresh_token: string;
    } = {
      refresh_token: refreshToken,
    };

    return await this.userRepository.update({ id }, modified);
  }
}
