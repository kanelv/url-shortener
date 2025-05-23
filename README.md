# URL SHORTENER

## Description

An URL-Shortener API app using NestJS that is a framework based on typescript

## Installation

```bash
yarn install
```

## Database

### Migration

To generate new migration.sql script for new changes on database schema
```bash
npm run migration:generate src/core/database/migrations/<name_of_new_changes>

npm run migration:generate src/infra/frameworks/database/migrations/change_userName_to_username_on_user_table
```

To apply new change on database
```bash
npm run migration:up
```

To rollback to previouse schema
```bash
npm run migration:down
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Running CircleCI Locally

```bash
circleci local execute build-and-test
```

#### Debug using SSH on CircleCI

```bash
ssh -i /path/to/id_rsa user@server.nixcraft.com
ssh -i ~/.ssh/id_ed25519_kanelv -p 64535 34.227.75.120
```

## References

https://www.digitalocean.com/community/tutorials/how-to-build-a-type-safe-url-shortener-in-nodejs-with-nestjs#step-1-preparing-your-development-environments

## Free PostgreSQL for demo
https://dev.to/prisma/set-up-a-free-postgresql-database-on-supabase-to-use-with-prisma-3pk6

## Stay in touch

- Author - [Cuong Le](https://github.com/kanelv)
