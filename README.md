<div id="top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Typescript][typescript-shield]][typescript-url]
[![NodeJs][nodejs-shield]][nodejs-url]
[![MongoDB][mongodb-shield]][mongodb-url]
[![AWS][aws-shield]][aws-url]
[![JWT][jwt-shield]][jwt-url]
[![Jest][jest-shield]][jest-url]
[![Kafka][kafka-shield]][kafka-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>

  <h3 align="center">Medstore Parkinson Webapp 🚀🚀🚀 </h3>

</div>

<br />

## Description

Medstore Parkinson project

## Prerequisites
We assume that all people are coming to here is `Programmer with intermediate knowledge` and also we need to understanding more knowledge before we start to reduce knowledge gaps.

* Understood [ExpressJs Fundamental](expressjs-url), NodeJs Base Framework. It will help we to understand how the NestJs works.
* Understood [Typescript Fundamental](typescript-url), Programming Language. It will help we to write and read the code.
* Understood [NestJs Fundamental](nestjs-fundamental-url), NodeJs Framework with support fully TypeScript.
* Understand what is and how NoSql works as a Database, specially [MongoDB](#acknowledgements).

## Build With
* [NestJs](nestjs-url) v7.6.11
* [Mongoose](mongoose-url) v5.11.14
* [MongoDB](mongodb-url) v4.4.0
* [NodeJs](nodejs-url) v12.21.0
* [Yarn](yarn-url) v1.22.10
* [Kafka](kafka-url) v2.8.0

## Features
The features will spill on this section, please read secretly and keep silent 🤫 🤫

- [x] Centralize Configuration
- [x] Centralize Exception
- [x] Centralize Response
- [x] Mongoose Implementation
- [x] Json Web Token Guard
- [x] Basic Auth Guard
- [x] Role and Permission Management.
- [x] Hash Password with Bcrypt
- [x] Database Migration
- [x] Support Multi Language
- [x] Incoming Request Validation
- [x] Logger Module level Database
- [x] Debugger Module level File, on/off feature
- [x] Custom Status Code for Each Error and Success Request

#### Modules
- [x] AppModule - MainModule
- [x] AuthModule
- [x] AwsModule - S3 Implementation
- [x] ConfigModule
- [x] DatabaseModule
- [x] DebuggerModule
- [x] Helper Module (e.g Manipulation DateTime, Random string or int, etc)
- [x] LoggerModule
- [x] MessageModule - Include LanguageModule
- [x] PaginationModule
- [x] PermissionModule
- [x] PipeModule - RequestValidationPipe
- [x] ResponseModule
- [x] RoleModule
- [x] UserModule
- [x] KafkaModule
  - [x] ProducerModule
  - [x] ConsumerModule
  - [x] AdminModule
- [ ] Other Module** (Ongoing)

[Welcome to request for other modules](issues-url)

#### Middleware
- [x] Rate Limit
- [x] Compression
- [x] Helmet
- [x] Cors
- [x] BodyParser

#### Example
- [x] Simple Test, and Error Test
- [x] Simple CRUD
- [x] Server Side Pagination
- [x] Access Token with JWT
- [x] Refresh Token with JWT
- [x] Basic Auth Implementation
- [x] Login
- [x] Block User, Block Role, and Block Permissions
- [ ] Sign Up
- [ ] Upload Image into AWS S3
- [x] Kafka Consume and Produce Message
- [x] Mongoose Population and Deep Population

#### Todo
- [ ] Update version NestJs
- [ ] Unit Test and E2E Test
- [ ] Update Performance ( Code quality and maybe change to fastify)
- [ ] Update Documentation

## Endpoints
All endpoints in [endpoints.json](endpoints.json) and need import to PostMan. [Follow this step for import into Postman](postman-import-endpoint)

## Getting Started
Before we start, we need to install :
- [NodeJs](nodejs-url) (Suggest LTS Version),
- [MongoDB](mongodb-url) (Suggest LTS Version), and
- **Optional**, [Kafka Apache](kafka-url) (Suggest LTS Version). 

Please see their official document.

> For Windows User, **do not install kafka on your Windows OS**. There are has a unsolved issue, while delete topic on Windows OS. 
> Go install kafka with virtual machine or docker.

#### Make sure that we don't get any error after installation, open our terminal and follow this instruction
1. Check NodeJs is successful installed in our OS. 
    ```sh
    node --version

    # will return 
    # v12.21.0
    ```

2. Check package manager is running, with yarn
    ```sh
    yarn --version

    # will return 
    # 1.22.10
    ```

    with npm
    ```sh
    npm --version

    # will return 
    # 7.8.0
    ```

3. Check MongoDB
    ```sh
    mongod --version

    # will return 
    # db version v4.4.0
    ```

4. **Optional**, Kafka
    ```sh
    kafka-topics --version

    # will return 
    # 2.8.0 (Commit:ebb1d6e21cc92130
    ```

#### Setting up the project
1. Install dependencies
    ```sh
    yarn
    ```

    with npm
    ```sh
    npm i
    ```

2. Build our Env based on `.env.example` file.
    ```sh
    cp .env.example .env
    ```

    and then we need to adjust with our env
    ```env
    APP_ENV=development
    APP_HOST=localhost
    APP_PORT= 3000
    APP_LANGUAGE=en
    APP_DEBUG=false
    APP_TZ=Asia/Jakarta

    DATABASE_HOST=localhost:27017
    DATABASE_NAME=parkinson
    DATABASE_USER=
    DATABASE_PASSWORD=
    DATABASE_ADMIN=false
    DATABASE_SRV=false
    DATABASE_DEBUG=false
    DATABASE_SSL=false
    DATABASE_OPTIONS=

    AUTH_JWT_ACCESS_TOKEN_SECRET_KEY=123456
    AUTH_JWT_ACCESS_TOKEN_EXPIRATION_TIME=1d
    AUTH_JWT_ACCESS_TOKEN_NOT_BEFORE_EXPIRATION_TIME=0
    AUTH_JWT_ACCESS_TOKEN_REMEMBER_ME_EXPIRATION_TIME=7d
    AUTH_JWT_ACCESS_TOKEN_REMEMBER_ME_NOT_BEFORE_EXPIRATION_TIME=0

    AUTH_JWT_REFRESH_TOKEN_SECRET_KEY=01001231
    AUTH_JWT_REFRESH_TOKEN_EXPIRATION_TIME=2d
    AUTH_JWT_REFRESH_TOKEN_NOT_BEFORE_EXPIRATION_TIME=1d
    AUTH_JWT_REFRESH_TOKEN_REMEMBER_ME_EXPIRATION_TIME=9d
    AUTH_JWT_REFRESH_TOKEN_REMEMBER_ME_NOT_BEFORE_EXPIRATION_TIME=7d

    AUTH_BASIC_TOKEN_CLIENT_ID=asdzxc
    AUTH_BASIC_TOKEN_CLIENT_SECRET=1234567890

    HELPER_IMAGE_MAX_SIZE=1048576

    KAFKA_CONSUMER_GROUP=nestjs.parkinson
    KAFKA_BROKERS=localhost:9092

    AWS_CREDENTIAL_KEY=awskey12345
    AWS_CREDENTIAL_SECRET=awssecret12345
    AWS_S3_REGION=us-east-2
    AWS_S3_BUCKET=acks3
    ```

3. Create Database, [follow this instruction from mongodb official](mongodb-create-database-url)

4. We need to Migration Role and Permission for first usage

    - Fresh migrate
      ```sh
      yarn migrate
      ```

      with npm
      ```sh
      npm run migrate
      ```

    - Rollback migrate
      ```sh
      yarn migrate:rollback
      ```

      with npm
      ```sh
      npm run migrate:rollback
      ```

5.  <strong> *** PLEASE SKIP THIS STEP, UNIT TEST, AND E2E TEST DO NOT FINISH YET *** </strong>. 

    Make sure we do the correct step. Go run `TestModule` and make sure all test passed with success status.

    - Run Unit Testing
      ```sh
      yarn test
      ```

      with npm
      ```sh
      npm run test
      ```

    - Run E2E Testing
      ```sh
      yarn test:e2e
      ```

      with npm
      ```sh
      npm run test:e2e
      ```

6. **Optional**, if we want to use `Kafka` we need to adjustment some point.
    In `src/main.ts`, Add This Code.

    ```ts
    // src/main.ts

    ...
    ...

    await app.listenAsync(port, host);

    const kafka = await import('./kafka');
    await kafka.default(
        app,
        configService,
        logger
    );

    ...
    ...

    ```

    In `src/app/app.module.ts`, Import add `KafkaAdminModule`, `KafkaProducerModule`, `KafkaConsumerModule`.

    ```ts
    // src/app/app.module.ts
    import { KafkaAdminModule } from 'src/kafka/admin/kafka.admin.module';
    import { KafkaProducerModule } from 'src/kafka/producer/producer.module';
    import { KafkaConsumerModule } from 'src/kafka/consumer/consumer.module';

    @Module({
      controllers: [AppController],
      providers: [],
      imports: [
        ...
        ...

        SeedsModule,
        KafkaAdminModule, // <<<---- Optional, add this if we want to create custom partition and partition replication
        KafkaProducerModule, // <<<---- Add this
        KafkaConsumerModule, // <<<---- Add this

        AuthModule,
        UserModule,

        ...
        ...
      ]
    })
    export class AppModule {}

    ```

    We can test `KafkaProducerModule` and `KafkaConsumerModule` with manual hit `/kafka/produce` endpoint.

    > Note: If we won't use kafka, simply we can delete `kafka folder` and remove `config in config/kafka.config.ts`

7. Last step, run the project
    ```sh
    yarn start:dev
    ```

    with npm
    ```sh
    npm run start:dev
    ```

Congrats !!! Cheers 🍻🍻, our project is running well. Now we can use all features.

Go install or open `REST Client` you prefer. In this case, let assume we use [Postman Client](postman-url). 
After installation, we need to import all endpoint into postman, [see this instruction](#endpoints).


## Usage
Documents usage will has difference file. Document will put in [USAGE.md](usage-url)

## License

Distributed under [MIT licensed](LICENSE.md)

<br />
<p align="right"><a href="#top">back to top</a></p>

<!-- NESTJS LINKS -->
[nestjs-url]: http://nestjs.com/
[nestjs-fundamental-url]: http://nestjs.com/

<!-- OTHER LINKS -->
[aws-url]: https://aws.amazon.com
[nodejs-url]: https://nodejs.org/
[bcrypt-url]: https://www.npmjs.com/package/bcrypt
[expressjs-url]: https://expressjs.com
[mongoose-url]: https://mongoosejs.com/
[mongodb-url]: https://docs.mongodb.com/
[passport-url]: https://github.com/jaredhanson/passport
[class-transformer-url]: https://github.com/typestack/class-transformer
[class-validation-url]: https://github.com/typestack/class-validator
[yarn-url]: https://yarnpkg.com
[typescript-url]: https://www.typescriptlang.org/
[jwt-url]: https://jwt.io
[postman-url]: https://www.postman.com/product/rest-client/
[postman-import-endpoint]: https://learning.postman.com/docs/getting-started/importing-and-exporting-data/
[mongodb-create-database-url]: https://www.mongodb.com/basics/create-database
[nodejs-bestpractice-url]: https://github.com/goldbergyoni/nodebestpractices
[kafka-url]: https://kafka.apache.org/quickstart
[jest-url]: https://jestjs.io/docs/getting-started
