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
import { RedisModule } from './modules/redis/redis.module';
import { LocationHandleModule } from './modules/location-handle/location-handle.module';
import { LocationHandleService } from './modules/location-handle/location-handle.service';
import { ContractModule } from './modules/contract/contract.module';
import { StandardPriceModule } from './modules/standard-price/standard-price.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PackageModule } from './modules/package/package.module';
import { UserPackageModule } from './modules/user_package/user_package.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { ConsumersModule } from './modules/consumers/consumers.module';
import { PaymentLogModule } from './modules/payment_log/payment_log.module';

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
    ClientsModule.register([
      {
        name: 'WEBHOOK_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'books_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    ConsumersModule,
    WebhookModule,
    // API Middlewares, auth modules
    AuthModule,

    // Business module
    LocationHandleModule,
    UsersModule,
    LocationsModule,
    OrdersModule,
    BillsModule,
    ContractModule,
    StandardPriceModule,
    PackageModule,
    UserPackageModule,

    //3rd modules
    PaymentModule,

    PaymentLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly locationsService: LocationsService,
    private readonly locationsHandleService: LocationHandleService,
  ) {}

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
    const records = [];
    const rawData = [];

    rl.on('line', (row) => {
      if (!row) {
        console.error('empty line');
      }

      const hardcodeRow = row.split(',"');
      //first item will be STT + DATE
      let splitData = [];
      try {
        splitData = splitData.concat(hardcodeRow[0].split(','));
        splitData.push(hardcodeRow[1]);
        splitData = splitData.concat(hardcodeRow[2].split(','));
      } catch (ex) {
        splitData = row.split(',');
      }
      const item = this.locationsService.transformRawData(splitData);
      rawData.push(item);
    });

    rl.on('close', async () => {
      console.log('close file');

      for (const item of rawData) {
        const refined = await this.locationsHandleService
          .createHandle(item.name)
          .then((handle) => {
            item.handle = handle;
            return item;
          })
          .catch((ex) => {
            console.log(ex, 'handle: ', item.name);
          });

        records.push(refined);
      }

      this.locationsService
        .createMany(records)
        .then(() => {
          console.log('create many location succeeded');
        })
        .catch((ex) => {
          console.error('create many locations failed, err: ', ex);
          throw ex;
        });
    });

    rl.on('error', (ex) => {
      console.error(ex);
    });
  }
}
