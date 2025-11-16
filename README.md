# URL Shortener

A URL shortener API built with NestJS and TypeScript, featuring PostgreSQL for relational data storage and DynamoDB for distributed storage capabilities.

## Table of Contents

- [URL Shortener](#url-shortener)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Setup](#setup)
    - [Environment Variables](#environment-variables)
      - [CircleCI](#circleci)
      - [Local Development](#local-development)
    - [Database Setup](#database-setup)
      - [PostgreSQL with Docker](#postgresql-with-docker)
      - [Troubleshooting: "Permission denied" Error on macOS](#troubleshooting-permission-denied-error-on-macos)
    - [AWS DynamoDB Setup](#aws-dynamodb-setup)
      - [Localstack Configuration](#localstack-configuration)
      - [Create DynamoDB Table](#create-dynamodb-table)
      - [DynamoDB Utility Commands](#dynamodb-utility-commands)
  - [Database Migrations](#database-migrations)
    - [Generate New Migration](#generate-new-migration)
    - [Apply Migrations](#apply-migrations)
    - [Rollback Migrations](#rollback-migrations)
  - [Running the Application](#running-the-application)
  - [Testing](#testing)
  - [CI/CD](#cicd)
    - [Running CircleCI Locally](#running-circleci-locally)
    - [Debug with SSH on CircleCI](#debug-with-ssh-on-circleci)
  - [References](#references)
    - [System Design \& Architecture](#system-design--architecture)
    - [Database Hosting](#database-hosting)
  - [Author](#author)

## Features

- URL shortening and redirection
- PostgreSQL database integration
- DynamoDB support for scalable storage
- RESTful API endpoints
- Comprehensive test coverage
- CircleCI integration

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Databases**: PostgreSQL, AWS DynamoDB
- **Containerization**: Docker
- **CI/CD**: CircleCI
- **Testing**: Jest

## Prerequisites

- Node.js (v20 or higher)
- Yarn
- Docker and Docker Compose
- AWS CLI (for DynamoDB local development)

## Installation

```bash
yarn install
```

## Setup

### Environment Variables

#### CircleCI

Add environment variables to CircleCI under `jobs.build-and-test.environment` in `.circleci/config.yml`.

#### Local Development

Create a `.env` file in the root directory of this project with the required environment variables.

### Database Setup

#### PostgreSQL with Docker

Run the following commands to set up a PostgreSQL Docker container:

```bash
# Give execute permission to the initialization script
chmod +x ./docker/postgres/init/1_connect.sh

# Start PostgreSQL container (port: 5432)
docker-compose -f ./docker/docker-compose.yml up -d
```

#### Troubleshooting: "Permission denied" Error on macOS

If you encounter permission errors when running Docker on macOS:

```bash
chmod: /var/lib/postgresql/data: Permission denied
find: /var/lib/postgresql/data: Permission denied
chown: /var/lib/postgresql/data: Permission denied
```

Run the following command to fix:

```bash
sudo chmod -R 777 ./docker/postgres/data
```

### AWS DynamoDB Setup

#### Localstack Configuration

In the local environment, we use Localstack to emulate AWS DynamoDB.

**Check for Localstack AWS Profile**

```bash
aws configure list --profile localstack
```

Expected output:
```
      Name                    Value             Type    Location
      ----                    -----             ----    --------
   profile               localstack           manual    --profile
access_key     ****************ummy shared-credentials-file
secret_key     ****************ummy shared-credentials-file
    region                us-east-1      config-file    ~/.aws/config
```

**Configure Localstack Profile** (if not already set up)

Add the following to `~/.aws/credentials`:

```ini
[localstack]
aws_access_key_id = dummy
aws_secret_access_key = dummy
```

Add the following to `~/.aws/config`:

```ini
[profile localstack]
region = us-east-1
output = json
```

#### Create DynamoDB Table

Create the ShortLink table in Localstack:

```bash
aws dynamodb create-table \
    --endpoint-url=http://localhost:4566 \
    --region=us-east-1 \
    --profile localstack \
    --table-name ShortLink \
    --attribute-definitions \
        AttributeName=shortCode,AttributeType=S \
        AttributeName=createdAt,AttributeType=N \
    --key-schema \
        AttributeName=shortCode,KeyType=HASH \
        AttributeName=createdAt,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5
```

#### DynamoDB Utility Commands

**Insert a test item:**

```bash
aws dynamodb put-item \
    --endpoint-url=http://localhost:4566 \
    --region=us-east-1 \
    --profile localstack \
    --table-name ShortLink \
    --item '{"shortCode":{"S":"abc123"},"createdAt":{"N":"1234567890"},"originalUrl":{"S":"https://example.com"}}'
```

**List all items in the table:**

```bash
aws dynamodb scan \
    --endpoint-url=http://localhost:4566 \
    --region=us-east-1 \
    --profile localstack \
    --table-name ShortLink
```

**List all tables:**

```bash
aws dynamodb list-tables \
    --endpoint-url=http://localhost:4566 \
    --region=us-east-1 \
    --profile localstack
```

## Database Migrations

### Generate New Migration

Create a new migration script for database schema changes:

```bash
npm run migration:generate src/infra/frameworks/database/migrations/<migration_name>
```

**Examples:**

```bash
npm run migration:generate src/infra/frameworks/database/migrations/change_userName_to_username_on_user_table

npm run migration:generate src/infra/frameworks/database/migrations/change_id_to_string_on_user_table
```

### Apply Migrations

Run pending migrations:

```bash
npm run migration:up
```

### Rollback Migrations

Revert the last migration:

```bash
npm run migration:down
```

## Running the Application

```bash
# Development mode
npm run start

# Watch mode (auto-reload on changes)
npm run start:dev

# Production mode
npm run start:prod
```

## Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## CI/CD

### Running CircleCI Locally

```bash
circleci local execute build-and-test
```

### Debug with SSH on CircleCI

When you enable SSH in a CircleCI build, connect using:

```bash
ssh -i ~/.ssh/id_ed25519_kanelv -p <PORT> <IP_ADDRESS>
```

**Example:**

```bash
ssh -i ~/.ssh/id_ed25519_kanelv -p 64535 34.227.75.120
```

## References

### System Design & Architecture

- [How to Build a Type-Safe URL Shortener in Node.js with NestJS](https://www.digitalocean.com/community/tutorials/how-to-build-a-type-safe-url-shortener-in-nodejs-with-nestjs)
- [URL Shortening System Design](https://systemdesign.one/url-shortening-system-design/#terminology)
- [System Design: URL Shortener](https://dev.to/karanpratapsingh/system-design-url-shortener-10i5)

### Database Hosting

- [Set up a Free PostgreSQL Database on Supabase](https://dev.to/prisma/set-up-a-free-postgresql-database-on-supabase-to-use-with-prisma-3pk6)

## Author

**Cuong Le** - [kanelv](https://github.com/kanelv)
