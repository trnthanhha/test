import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import NotificationTemplate from './notificationTemplate.entitiy';

@Entity()
class NotificationTopic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: true })
  deleteable: boolean;

  @ManyToMany(() => NotificationTemplate, (template) => template.topics, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'notification_templates_topics',
    joinColumn: { name: 'topic_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'template_id', referencedColumnName: 'id' },
  })
  templates: NotificationTemplate[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default NotificationTopic;
