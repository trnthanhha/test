import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import fs from 'fs';
import readline from 'readline';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { LocationsModule } from './modules/locations/locations.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BillsModule } from './modules/bills/bills.module';
import { PaymentModule } from './services/payment/payment.module';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { LocationsService } from './modules/locations/locations.service';
import { Location } from './modules/locations/entities/location.entity';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    // global
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: __dirname + '/i18n/',
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    // cron job
    ScheduleModule.forRoot(),
    // db connection
    DatabaseModule,
    //Microservices modules
    RedisModule,
    // API Middlewares, auth modules
    AuthModule,

    // Business module
    UsersModule,
    LocationsModule,
    OrdersModule,
    BillsModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly locationsService: LocationsService) {}

  public async onModuleInit(): Promise<void> {
    const filePath = 'src/data.csv';
    const existed = await this.locationsService.existAny();
    if (existed) {
      return;
    }

    if (!fs.existsSync(filePath)) {
      return;
    }
    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({ input: stream });
    const data = [] as Array<Location>;

    rl.on('line', (row) => {
      if (!row) {
        console.error('empty line');
      }
      data.push(this.locationsService.transformRawData(row.split(',')));
    });

    rl.on('close', () => {
      this.locationsService.createMany(data);
    });

    rl.on('error', (ex) => {
      console.error(ex);
    });
  }
}
