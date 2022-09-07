import { Auth } from '@decorators/roles.decorator';
import { GetAuthUser } from '@decorators/user.decorator';
import { NotificationApis } from '@modules/api/api.constant';
import User from '@modules/user/entities/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { List } from '@utils/list-response';
import {
  BatchResponse,
  MessagingTopicResponse,
} from 'firebase-admin/lib/messaging/messaging-api';
import { I18n, I18nContext } from 'nestjs-i18n';
import { DeleteResult, UpdateResult } from 'typeorm';
import { DeleteMultiNotificationDto } from './dto/notification/delete-multi-notification.dto';
import { ListNotificationDto } from './dto/notification/list-notification.dto';
import { ReadNotificationDto } from './dto/notification/read-notification.dto';
import { CreateNoticeTemplateDto } from './dto/template/create-template.dto';
import { ListTemplateDto } from './dto/template/list-template.dto';
import { SendNotificationDto } from './dto/template/send-notice.dto';
import { UpdateTemplateDto } from './dto/template/update-template.dto';
import { CreateTopicDto } from './dto/topic/create-topic.dto';
import { ListTopicDto } from './dto/topic/list-topic.dto';
import { UpdateTopicDto } from './dto/topic/update-topic.dto';
import Notification from './entities/notification.entity';
import Template from './entities/notificationTemplate.entitiy';
import Topic from './entities/notificationTopic.entity';
import { NotificationService } from './notification.service';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Notification of user
   */

  @Auth()
  @ApiOperation({ summary: 'Find all my notice' })
  @Get('my')
  findMyNotice(
    @Query() query: ListNotificationDto,
    @GetAuthUser() user: User,
  ): Promise<List<Notification>> {
    return this.notificationService.findMyNotice(query, user);
  }

  @Auth()
  @ApiOperation({ summary: 'Find one notice' })
  @Get('my/:id')
  findOneNotice(
    @Param('id') id: string,
    @GetAuthUser() user: User,
    @I18n() i18n: I18nContext,
  ): Promise<Notification> {
    return this.notificationService.findOneNotice(+id, user, i18n.lang);
  }

  @Auth()
  @ApiOperation({ summary: 'Read one notice' })
  @Post('read')
  readNotice(
    @Body() readNotificationDto: ReadNotificationDto,
    @GetAuthUser() user: User,
    @I18n() i18n: I18nContext,
  ): Promise<Notification> {
    return this.notificationService.readNotice(
      readNotificationDto,
      user,
      i18n.lang,
    );
  }

  @Auth()
  @ApiOperation({ summary: 'Read all my notice' })
  @Post('readAll')
  readAllNotice(@GetAuthUser() user: User): Promise<UpdateResult> {
    return this.notificationService.readAllNotice(user);
  }

  @Auth()
  @ApiOperation({ summary: 'Delete multi my notice' })
  @Delete('prune')
  removeMultiNotice(
    @Body() deleteMultiNotificationDto: DeleteMultiNotificationDto,
    @GetAuthUser() user: User,
  ): Promise<DeleteResult> {
    return this.notificationService.removeMultiNotice(
      deleteMultiNotificationDto,
      user,
    );
  }

  @Auth()
  @ApiOperation({ summary: 'Delete all my notice' })
  @Delete('pruneAll')
  removeAllNotice(@GetAuthUser() user: User): Promise<DeleteResult> {
    return this.notificationService.removeAllNotice(user);
  }

  @Auth()
  @ApiOperation({ summary: 'Delete one notice' })
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetAuthUser() user: User,
    @I18n() i18n: I18nContext,
  ): Promise<DeleteResult> {
    return this.notificationService.removeNotice(+id, user, i18n.lang);
  }

  /**
   * Notification Template, admin manage
   */

  @Post('sendTest')
  sendNoticeTest() {
    return this.notificationService.sendNoticeTest();
  }

  @Auth(NotificationApis.SEND_NOTICE)
  @ApiOperation({
    summary: 'Send notice, role ADMIN or role have permission SEND_NOTICE',
  })
  @Post('send')
  sendNotice(
    @Body() sendNotificationDto: SendNotificationDto,
    @I18n() i18n: I18nContext,
  ): Promise<BatchResponse | MessagingTopicResponse[]> {
    return this.notificationService.sendNotice(
      sendNotificationDto.id,
      i18n.lang,
    );
  }

  @Auth(NotificationApis.ADD_TEMPLATE)
  @ApiOperation({
    summary:
      'Create a template, role ADMIN or role have permission ADD_TEMPLATE',
  })
  @Post('template')
  createTemplate(
    @Body() createTemplateDto: CreateNoticeTemplateDto,
  ): Promise<Template> {
    return this.notificationService.createTemplate(createTemplateDto);
  }

  @Auth(NotificationApis.VIEW_TEMPLATE)
  @ApiOperation({
    summary:
      'Find all template, role ADMIN or role have permission VIEW_TEMPLATE',
  })
  @Get('/template')
  findTemplate(@Query() query: ListTemplateDto): Promise<List<Template>> {
    return this.notificationService.findTemplate(query);
  }

  @Auth(NotificationApis.VIEW_TEMPLATE)
  @ApiOperation({
    summary:
      'Find a template, role ADMIN or role have permission VIEW_TEMPLATE',
  })
  @Get('template/:id')
  findOneTemplate(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<Template> {
    return this.notificationService.findOneTemplate(+id, i18n.lang);
  }

  @Auth(NotificationApis.EDIT_TEMPLATE)
  @ApiOperation({
    summary:
      'Update a template, role ADMIN or role have permission EDIT_TEMPLATE',
  })
  @Put('template/:id')
  updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @I18n() i18n: I18nContext,
  ): Promise<Template> {
    return this.notificationService.updateTemplate(
      +id,
      updateTemplateDto,
      i18n.lang,
    );
  }

  @Auth(NotificationApis.DELETE_TEMPLATE)
  @ApiOperation({
    summary:
      'Delete a template, role ADMIN or role have permission DELETE_TEMPLATE',
  })
  @Delete('template/:id')
  removeTemplate(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<DeleteResult> {
    return this.notificationService.removeTemplate(+id, i18n.lang);
  }

  /**
   * Notification Topic, admin manage
   */

  @Auth(NotificationApis.ADD_TOPIC)
  @ApiOperation({
    summary: 'Create a topic, role ADMIN or role have permission ADD_TOPIC',
  })
  @Post('topic')
  createTopic(
    @Body() createTopicDto: CreateTopicDto,
    @I18n() i18n: I18nContext,
  ): Promise<Topic> {
    return this.notificationService.createTopic(createTopicDto, i18n.lang);
  }

  @Auth(NotificationApis.VIEW_TOPIC)
  @ApiOperation({
    summary: 'Find all topic, role ADMIN or role have permission VIEW_TOPIC',
  })
  @Get('/topic')
  findTopic(@Query() query: ListTopicDto): Promise<List<Topic>> {
    return this.notificationService.findTopic(query);
  }

  @Auth(NotificationApis.VIEW_TOPIC)
  @ApiOperation({
    summary: 'Find a topic, role ADMIN or role have permission VIEW_TOPIC',
  })
  @Get('topic/:id')
  findOneTopic(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<Topic> {
    return this.notificationService.findOneTopic(+id, i18n.lang);
  }

  @Auth(NotificationApis.EDIT_TOPIC)
  @ApiOperation({
    summary: 'Update a topic, role ADMIN or role have permission EDIT_TOPIC',
  })
  @Put('topic/:id')
  updateTopic(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @I18n() i18n: I18nContext,
  ): Promise<Topic> {
    return this.notificationService.updateTopic(+id, updateTopicDto, i18n.lang);
  }

  @Auth(NotificationApis.DELETE_TOPIC)
  @ApiOperation({
    summary: 'Delete a topic, role ADMIN or role have permission DELETE_TOPIC',
  })
  @Delete('topic/:id')
  removeTopic(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<DeleteResult> {
    return this.notificationService.removeTopic(+id, i18n.lang);
  }
}
