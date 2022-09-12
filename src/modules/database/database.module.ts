import { Module } from '@nestjs/common';
import 'dotenv/config';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST'),
        port: +config.get<string>('POSTGRES_PORT'),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: config.get<string>('POSTGRES_DB'),
        entities: [__dirname + '/../**/*.entity.ts'],
        migrations: ['dist/migrations/*{.ts,.js}'],
        cli: {
          migrationsDir: 'migrations',
        },
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
  ],
  controllers: [DatabaseController],
  providers: [DatabaseService],
})
export class DatabaseModule {}
