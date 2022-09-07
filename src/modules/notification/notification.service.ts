import { Roles } from '@modules/role/role.constant';
import { DeviceService } from '@modules/device/device.service';
import User from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { removeSpecialCharacters } from '@utils/common';
import { List } from '@utils/list-response';
import { OrderBy } from '@utils/order-by';
import * as admin from 'firebase-admin';
import {
  BatchResponse,
  MessagingTopicManagementResponse,
  MessagingTopicResponse,
} from 'firebase-admin/lib/messaging/messaging-api';
import { difference, lowerCase, trim, uniqBy } from 'lodash';
import { I18nService } from 'nestjs-i18n';
import {
  DeleteResult,
  FindOperator,
  getRepository,
  In,
  Raw,
  Repository,
  UpdateResult,
} from 'typeorm';
import Lock from '../lock/entities/lock.entity';
import { CreateNotificationDto } from './dto/notification/create-notification.dto';
import { DeleteMultiNotificationDto } from './dto/notification/delete-multi-notification.dto';
import {
  ListNotificationDto,
  SortByNotification,
} from './dto/notification/list-notification.dto';
import { ReadNotificationDto } from './dto/notification/read-notification.dto';
import { CreateNoticeTemplateDto } from './dto/template/create-template.dto';
import {
  ListTemplateDto,
  SortByTemplate,
} from './dto/template/list-template.dto';
import { UpdateTemplateDto } from './dto/template/update-template.dto';
import { CreateTopicDto } from './dto/topic/create-topic.dto';
import { ListTopicDto, SortByTopic } from './dto/topic/list-topic.dto';
import { UpdateTopicDto } from './dto/topic/update-topic.dto';
import Notification from './entities/notification.entity';
import Template, {
  TemplateTypes,
} from './entities/notificationTemplate.entitiy';
import Topic from './entities/notificationTopic.entity';
import { Topics } from './notification.constant';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    private readonly i18n: I18nService,
    private readonly userService: UserService,
    private readonly deviceService: DeviceService,
  ) {}

  async onModuleInit(): Promise<void> {
    /**
     * Init @Topic
     */
    await Promise.all(
      Object.values(Topics).map(async (name: string) => {
        const topic: Topic = await this.topicRepository.findOne({ name });

        if (!topic) {
          const nTopic: Topic = new Topic();

          nTopic.name = name;
          nTopic.deleteable = false;

          await this.topicRepository.save(nTopic);
        }
      }),
    );
  }

  /**
   * Notification templates, admin manage
   */

  async createTemplate({
    title,
    content,
    type,
    topicIds = [],
    userIds = [],
  }: CreateNoticeTemplateDto): Promise<Template> {
    const nTemplate: Template = new Template();

    nTemplate.title = trim(title);
    nTemplate.content = content;
    nTemplate.type = type;

    if (type === TemplateTypes.TOPIC) {
      const setTopicIds: number[] = [...new Set(topicIds)];

      const topics: Topic[] = await Promise.all(
        setTopicIds.map(
          async (topicId: number) =>
            await this.topicRepository.findOne(topicId),
        ),
      );

      nTemplate.topics = topics.filter((topic: Topic) => !!topic);
    }

    if (type === TemplateTypes.USER) {
      const setUserIds: number[] = [...new Set(userIds)];

      const users: User[] = await Promise.all(
        setUserIds.map(
          async (userId: number) =>
            await this.userService.findByCondition({ id: userId }),
        ),
      );

      nTemplate.users = users.filter((user: User) => !!user);
    }

    return await this.templateRepository.save(nTemplate);
  }

  async findTemplate(query: ListTemplateDto): Promise<List<Template>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = SortByTemplate.ID,
      orderBy = OrderBy.ASC,
      type,
      title,
    } = query;

    let nPage: number = +page;

    if (nPage < 1) {
      nPage = 1;
    }

    const limit: number = +pageSize;
    const skip: number = (nPage - 1) * limit;

    const filters: {
      type?: TemplateTypes;
      title?: FindOperator<string>;
    } = {};

    const nTitle: string = trim(title);

    if (nTitle) {
      filters.title = Raw(
        (alias: string) => `LOWER(${alias}) Like '%${lowerCase(nTitle)}%'`,
      );
    }

    if (type) {
      filters.type = type;
    }

    const [data, total]: [Template[], number] =
      await this.templateRepository.findAndCount({
        where: filters,
        order: { [sortBy]: orderBy },
        take: limit,
        skip,
      });

    return {
      data,
      page: nPage,
      pageSize: limit,
      total,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOneTemplate(id: number, lang: string): Promise<Template> {
    const template: Template = await this.templateRepository.findOne(id, {
      relations: ['users', 'topics'],
    });

    if (!template) {
      const message: string = await this.i18n.t(
        'notification.template.notFound',
        {
          lang,
        },
      );

      throw new NotFoundException(message);
    }

    return template;
  }

  async updateTemplate(
    id: number,
    { title, content, type, userIds, topicIds }: UpdateTemplateDto,
    lang: string,
  ): Promise<Template> {
    const template: Template = await this.findOneTemplate(id, lang);

    template.title = trim(title);
    template.content = content;
    template.type = type;

    if (type === TemplateTypes.TOPIC) {
      const setTopicIds: number[] = [...new Set(topicIds)];

      const topics: Topic[] = await Promise.all(
        setTopicIds.map(
          async (topicId: number) =>
            await this.topicRepository.findOne(topicId),
        ),
      );

      template.topics = topics.filter((topic: Topic) => !!topic);
    }

    if (type === TemplateTypes.USER) {
      const setUserIds: number[] = [...new Set(userIds)];

      const users: User[] = await Promise.all(
        setUserIds.map(
          async (userId: number) =>
            await this.userService.findByCondition({ id: userId }),
        ),
      );

      template.users = users.filter((user: User) => !!user);
    }

    return await this.templateRepository.save(template);
  }

  async removeTemplate(id: number, lang: string): Promise<DeleteResult> {
    await this.findOneTemplate(id, lang);

    return await this.templateRepository.delete(id);
  }

  async sendNoticeTest() {
    const lockInactive: Lock[] = await getRepository(Lock)
      .createQueryBuilder('lock')
      .andWhere('lock.attempTurnOnGps >= 3')
      .getMany();
    const listLock: string = lockInactive.map((l: Lock) => l.IMEI).join(', ');
    const content = `[${listLock}]`;

    const response: BatchResponse = await admin.messaging().sendMulticast({
      notification: { title: 'Hello', body: 'This is a new notification' },
      tokens: [
        'dFomKZpuW3bup4QZvf88LI:APA91bGo34GXsdlOpmPWoO2rLz-_PTw7iUGHypOEdTsOz_NDJMS-6MAOXn5m_9Z21Q3sM8NO5EwNiM1ylON_cj9feRyx9uLnwrvfGwWDVDuX-nt6Q8uhmgOMdlTDeLImdZUlgRWLGhUV',
      ],
      data: {
        content,
      },
    });

    return response;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async sendNoticeLockInactive() {
    // Get all lock inactive (count attemp turn on gps >= 3)
    const lockInactive: Lock[] = await getRepository(Lock)
      .createQueryBuilder('lock')
      .andWhere('lock.attempTurnOnGps >= 3')
      .getMany();

    // Get all admin user (for send notification)
    const users: User[] = await getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .andWhere('roles.name = :rName', { rName: Roles.ADMIN })
      .getMany();

    // Send notification lock has no GPS for admin user
    const title = 'Health check lock status';
    const body = 'Các khóa đang không nhận GPS:';
    await Promise.all(
      users.map(async (user: User) => {
        const registrationTokens: string[] =
          await this.deviceService.findFcmByUser(user.id);
        const flatRegistrationTokens: string[] = registrationTokens.flat();

        const dataContent = lockInactive.map((l: Lock) => l.IMEI).join(', ');
        const content = `[${dataContent}]`;

        if (registrationTokens.length > 0) {
          await admin.messaging().sendMulticast({
            notification: {
              title,
              body,
            },
            tokens: flatRegistrationTokens,
            data: {
              content,
            },
          });

          const nNotice: Notification = new Notification();

          nNotice.user = user;
          nNotice.title = title;
          nNotice.content = content;

          await this.notificationRepository.save(nNotice);
        }
      }),
    );
  }

  async sendNotice(
    templateId: number,
    lang: string,
  ): Promise<BatchResponse | MessagingTopicResponse[]> {
    const template: Template = await this.findOneTemplate(templateId, lang);

    let response: BatchResponse | MessagingTopicResponse[];
    let notices: Notification[] = [];
    let users: User[] = [];
    switch (template.type) {
      case TemplateTypes.USER:
        const registrationTokens: string[] = (
          await Promise.all(
            template.users.map(
              async (user: User) =>
                await this.deviceService.findFcmByUser(user.id),
            ),
          )
        ).flat();

        if (registrationTokens.length > 0) {
          response = await admin.messaging().sendMulticast({
            notification: { title: template.title, body: template.content },
            tokens: registrationTokens,
          });
        }

        users = template.users;
        break;
      case TemplateTypes.TOPIC:
        response = await Promise.all(
          template.topics.map(async (t: Topic) => {
            const send: MessagingTopicResponse = await admin
              .messaging()
              .sendToTopic(
                t.name,
                {
                  notification: {
                    title: template.title,
                    body: template.content,
                  },
                },
                {
                  priority: 'high',
                },
              );
            if (t.name === Topics.ALL) {
              users = await this.userService.findAll();
            } else {
              const topic: Topic = await this.topicRepository.findOne(t.id, {
                relations: ['users'],
              });

              users = [...users, ...topic.users];
            }

            return send;
          }),
        );
        break;
      default:
        break;
    }

    notices = uniqBy(users, 'id').map((user: User) => {
      const nNotice: Notification = new Notification();

      nNotice.title = template.title;
      nNotice.content = template.content;
      nNotice.user = user;

      return nNotice;
    });

    if (notices.length > 0) {
      await this.notificationRepository.save(notices);
    }

    return response;
  }

  async sendNoticeToUser({
    title,
    content,
    tokens,
    user,
  }: {
    title: string;
    content: string;
    tokens: string[];
    user: User;
  }) {
    let response: BatchResponse;

    if (tokens.length > 0) {
      response = await admin.messaging().sendMulticast({
        notification: { title, body: content },
        tokens,
      });
    }

    const nNotice: Notification = new Notification();

    nNotice.title = title;
    nNotice.content = content;
    nNotice.user = user;

    await this.notificationRepository.save(nNotice);

    return response;
  }

  /**
   * Notification Topics, admin manage
   */

  verifyFcmToken(fcmToken: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      return admin
        .messaging()
        .send(
          {
            token: fcmToken,
          },
          true,
        )
        .then(() => resolve(true))
        .catch((error: Error) => {
          console.log('🚀 ~ error', error, fcmToken);
          resolve(false);
        });
    });
  }

  async subcribeToTopic(
    fcmToken: string,
    topic: string,
  ): Promise<MessagingTopicManagementResponse> {
    return this.verifyFcmToken(fcmToken).then((valid: boolean) => {
      if (valid) {
        return admin.messaging().subscribeToTopic(fcmToken, topic);
      }
    });
  }

  async unsubscribeFromTopic(
    fcmToken: string,
    topic: string,
  ): Promise<MessagingTopicManagementResponse> {
    return this.verifyFcmToken(fcmToken).then((valid: boolean) => {
      if (valid) {
        return admin.messaging().unsubscribeFromTopic(fcmToken, topic);
      }
    });
  }

  async createTopic(
    { name: nName, description, userIds }: CreateTopicDto,
    lang: string,
  ): Promise<Topic> {
    const name: string = removeSpecialCharacters(nName, 'upper');

    if (!name) {
      const message: string = await this.i18n.t(
        'notification.topic.nameInvalid',
        { lang },
      );

      throw new BadRequestException(message);
    }

    const defaultTopics: string[] = Object.values(Topics);
    const isNameForbid: boolean = defaultTopics.includes(name);

    const topic: Topic = await this.topicRepository.findOne({ name });

    if (isNameForbid || topic) {
      const message: string = await this.i18n.t('notification.topic.existed', {
        lang,
      });

      throw new ForbiddenException(message);
    }

    const nTopic: Topic = new Topic();

    nTopic.name = name;
    nTopic.description = description;

    const setUserIds: number[] = [...new Set(userIds)];

    const users: User[] = await Promise.all(
      setUserIds.map(
        async (userId: number) =>
          await this.userService.findByCondition({ id: userId }),
      ),
    );

    nTopic.users = users.filter((user: User) => !!user);

    const create: Topic = await this.topicRepository.save(nTopic);

    const registrationTokens: string[] = (
      await Promise.all(
        setUserIds.map(
          async (userId: number) =>
            await this.deviceService.findFcmByUser(userId),
        ),
      )
    ).flat();

    if (registrationTokens.length > 0) {
      await admin.messaging().subscribeToTopic(registrationTokens, name);
    }

    return create;
  }

  async findTopic(query: ListTopicDto): Promise<List<Topic>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = SortByTopic.ID,
      orderBy = OrderBy.ASC,
      name,
    } = query;

    let nPage: number = +page;

    if (nPage < 1) {
      nPage = 1;
    }

    const limit: number = +pageSize;
    const skip: number = (nPage - 1) * limit;

    const filters: {
      name?: FindOperator<string>;
    } = {};

    const nName: string = trim(name);

    if (nName) {
      filters.name = Raw(
        (alias: string) => `LOWER(${alias}) Like '%${lowerCase(nName)}%'`,
      );
    }

    const [data, total]: [Topic[], number] =
      await this.topicRepository.findAndCount({
        where: filters,
        order: { [sortBy]: orderBy },
        take: limit,
        skip,
      });

    return {
      data,
      page: nPage,
      pageSize: limit,
      total,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOneTopic(id: number, lang: string): Promise<Topic> {
    const topic: Topic = await this.topicRepository.findOne(id, {
      relations: ['users', 'templates'],
    });

    if (!topic) {
      const message: string = await this.i18n.t('notification.topic.notFound', {
        lang,
      });

      throw new NotFoundException(message);
    }

    return topic;
  }

  async findTopicByUser(user: User): Promise<Topic[]> {
    return await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.users', 'users')
      .where('users.id = :id', { id: user.id })
      .getMany();
  }

  async updateTopic(
    id: number,
    { name: nName, description, userIds }: UpdateTopicDto,
    lang: string,
  ): Promise<Topic> {
    const name: string = removeSpecialCharacters(nName, 'upper');

    if (!name) {
      const message: string = await this.i18n.t(
        'notification.topic.nameInvalid',
        { lang },
      );

      throw new BadRequestException(message);
    }

    const defaultTopics: string[] = Object.values(Topics);
    const isNameForbid: boolean = defaultTopics.includes(name);

    const topic: Topic = await this.findOneTopic(id, lang);
    const isTopicDefault: boolean = defaultTopics.includes(topic.name);
    const isRename: boolean = topic.name !== name;

    if (isTopicDefault && isRename) {
      const message: string = await this.i18n.t(
        'notification.topic.changeNameDefault',
        {
          lang,
        },
      );

      throw new NotAcceptableException(message);
    }

    if (isNameForbid && !isTopicDefault) {
      const message: string = await this.i18n.t('notification.topic.unique', {
        lang,
        args: { topicName: name },
      });

      throw new NotAcceptableException(message);
    }

    const setUserIds: number[] = [...new Set(userIds)];
    const oldUserIds: number[] = topic.users.map((user: User) => user.id);
    const userIdsUnsubscribe: number[] = isRename
      ? oldUserIds
      : difference(oldUserIds, setUserIds);

    if (topic.name !== Topics.ALL) {
      const users: User[] = await Promise.all(
        setUserIds.map(
          async (userId: number) =>
            await this.userService.findByCondition({ id: userId }),
        ),
      );

      topic.users = users.filter((user: User) => !!user);

      // Unsubscribe user token not to be selected
      const registrationTokensUnsubscribe: string[] = (
        await Promise.all(
          userIdsUnsubscribe.map(
            async (userId: number) =>
              await this.deviceService.findFcmByUser(userId),
          ),
        )
      ).flat();

      if (registrationTokensUnsubscribe.length > 0) {
        await admin
          .messaging()
          .unsubscribeFromTopic(registrationTokensUnsubscribe, topic.name);
      }

      // Subscribe new user token to topic
      const registrationTokens: string[] = (
        await Promise.all(
          setUserIds.map(
            async (userId: number) =>
              await this.deviceService.findFcmByUser(userId),
          ),
        )
      ).flat();

      if (registrationTokens.length > 0) {
        await admin.messaging().subscribeToTopic(registrationTokens, name);
      }
    }

    if (!isNameForbid && topic.deleteable) {
      topic.name = name;
    }

    topic.description = description;

    return await this.topicRepository.save(topic);
  }

  async removeTopic(id: number, lang: string): Promise<any> {
    const topic: Topic = await this.findOneTopic(id, lang);

    if (!topic.deleteable) {
      const message: string = await this.i18n.t(
        'notification.topic.deleteable',
        {
          lang,
          args: { topicName: topic.name },
        },
      );

      throw new ForbiddenException(message);
    }

    const response: DeleteResult = await this.topicRepository.delete(id);

    const registrationTokens: string[] = (
      await Promise.all(
        topic.users.map(
          async (user: User) => await this.deviceService.findFcmByUser(user.id),
        ),
      )
    ).flat();

    if (registrationTokens.length > 0) {
      await admin
        .messaging()
        .unsubscribeFromTopic(registrationTokens, topic.name);
    }

    return response;
  }

  /**
   * Notification of user
   */

  async createNotice(
    { title, content }: CreateNotificationDto,
    user: User,
  ): Promise<Notification> {
    const notification: Notification = new Notification();

    notification.title = trim(title);
    notification.content = content;
    notification.user = user;

    return await this.notificationRepository.save(notification);
  }

  async findMyNotice(
    query: ListNotificationDto,
    user: User,
  ): Promise<List<Notification>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy = SortByNotification.ID,
      orderBy = OrderBy.ASC,
    } = query;

    let nPage: number = +page;

    if (nPage < 1) {
      nPage = 1;
    }

    const limit: number = +pageSize;
    const skip: number = (nPage - 1) * limit;

    const filters: {
      user: Record<string, number>;
    } = {
      user: { id: user.id },
    };

    const [data, total]: [Notification[], number] =
      await this.notificationRepository.findAndCount({
        where: filters,
        order: { [sortBy]: orderBy },
        take: limit,
        skip,
      });

    return {
      data,
      page: nPage,
      pageSize: limit,
      total,
      totalPage: Math.ceil(total / limit),
    };
  }

  async findOneNotice(
    id: number,
    user: User,
    lang: string,
  ): Promise<Notification> {
    const notification: Notification =
      await this.notificationRepository.findOne({ id, user: { id: user.id } });

    if (!notification) {
      const message: string = await this.i18n.t('notification.notFound', {
        lang,
      });

      throw new NotFoundException(message);
    }

    return notification;
  }

  async readNotice(
    { id }: ReadNotificationDto,
    user: User,
    lang: string,
  ): Promise<Notification> {
    const notification = await this.findOneNotice(id, user, lang);

    notification.isRead = true;

    return await this.notificationRepository.save(notification);
  }

  async readAllNotice(user: User): Promise<UpdateResult> {
    return await this.notificationRepository.update(
      { user: { id: user.id } },
      { isRead: true },
    );
  }

  async removeNotice(
    id: number,
    user: User,
    lang: string,
  ): Promise<DeleteResult> {
    await this.findOneNotice(id, user, lang);

    return await this.notificationRepository.delete(id);
  }

  async removeMultiNotice(
    { ids }: DeleteMultiNotificationDto,
    user: User,
  ): Promise<DeleteResult> {
    const setIds: number[] = [...new Set(ids)];

    return await this.notificationRepository.delete({
      id: In(setIds),
      user: { id: user.id },
    });
  }

  async removeAllNotice(user: User): Promise<DeleteResult> {
    return await this.notificationRepository.delete({ user: { id: user.id } });
  }
}
