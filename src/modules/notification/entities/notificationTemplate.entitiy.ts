import User from '@modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import NotificationTopic from './notificationTopic.entity';

export enum TemplateTypes {
  USER = 'USER',
  TOPIC = 'TOPIC',
}

@Entity()
class NotificationTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ default: '' })
  content: string;

  @Column()
  type: TemplateTypes;

  @ManyToMany(() => User, (user) => user.templates, { onDelete: 'CASCADE' })
  users: User[];

  @ManyToMany(() => NotificationTopic, (topic) => topic.templates, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'notification_templates_topics',
    joinColumn: { name: 'templateId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'topicId', referencedColumnName: 'id' },
  })
  topics: NotificationTopic[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default NotificationTemplate;
