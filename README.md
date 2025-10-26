# URL SHORTENER

An URL-Shortener API app using NestJS that is a framework based on typescript

## API Specification

## Setup

### Environment Variables

#### On CircleCI

Please add any environment variables to CircleCI under `jobs.build-and-test.environment` in `.circleci/config.yml`.

#### On Local

Please create .env file in the root directory of this project.

### Local Environment

**Docker**

Please run these commands below to set up a postgres docker running container on your machine

```bash
# Give the 1_connect.sh file execute permission
chmod +x ./docker/postgres/init/1_connect.sh

# Run postgresql(port: 5432)
docker-compose -f ./docker/docker-compose.yml up -d
```

#### "Permission denied" error

When you are running docker on MacOS, you may get the following error.

```shell
chmod: /var/lib/postgresql/data: Permission denied
find: /var/lib/postgresql/data: Permission denied
chown: /var/lib/postgresql/data: Permission denied
```

In this case, run the following command.

```shell
 sudo chmod -R 777 ./docker/postgres/data
```

## AWS DynamoDB
### Localstack

In the local environment, we use localstack to emulate AWS.

Check if you have profile called localstack

```
$ aws configure list --profile localstack
      Name                    Value             Type    Location
      ----                    -----             ----    --------
   profile               localstack           manual    --profile
access_key     ****************ummy shared-credentials-file    
secret_key     ****************ummy shared-credentials-file    
    region           ap-northeast-1      config-file    ~/.aws/config
```


If you have not set up localstack profile, add profile as below.

In `~/.aws/credentials`, add below.

```txt
[localstack]
aws_access_key_id = dummy
aws_secret_access_key = dummy
```

In ` ~/.aws/config`, add below.

```
[profile localstack]
region = ap-northeast-1
output = json
```

#### Create DynamoDB Table in localstack by command

```bash
# https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/getting-started-step-1.html
aws dynamodb create-table --endpoint-url=http://localhost:4566 --region=ap-northeast-1 --profile localstack \
    --table-name MarketSubmitHistoryTable \
    --attribute-definitions \
    	AttributeName=marketSubmitId,AttributeType=S \
    	AttributeName=message,AttributeType=S \
    --key-schema \
    	AttributeName=marketSubmitId,KeyType=HASH \
    	AttributeName=message,KeyType=RANGE \
    --provisioned-throughput \
    	ReadCapacityUnits=5,WriteCapacityUnits=5
```
#### Put an Item
```bash
aws dynamodb put-item --endpoint-url=http://localhost:4566 --region=ap-northeast-1 --profile localstack --table-name MarketSubmitHistoryTable --item "{\"marketSubmitId\":{\"S\":\"1\"},\"message\":{\"S\":\"sample message\"}}"
```

#### Scan all items in the table
```bash
aws dynamodb scan --endpoint-url=http://localhost:4566 --region=ap-northeast-1 --profile localstack --table-name MarketSubmitHistoryTable
```

### AWS Console

## Installation

```bash
yarn install
```

## Database Schema Migration

To generate new migration.sql script for new changes on database schema
```bash
npm run migration:generate src/core/database/migrations/<name_of_new_changes>

npm run migration:generate src/infra/frameworks/database/migrations/change_userName_to_username_on_user_table
```

To apply new change on database
```bash
npm run migration:up
```

To rollback to previous schema
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
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Running CircleCI Locally

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
https://systemdesign.one/url-shortening-system-design/#terminology
https://dev.to/karanpratapsingh/system-design-url-shortener-10i5

## Free PostgreSQL for demo
https://dev.to/prisma/set-up-a-free-postgresql-database-on-supabase-to-use-with-prisma-3pk6

## Stay in touch

- Author - [Cuong Le](https://github.com/kanelv)
