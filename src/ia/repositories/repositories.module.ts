import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AbstractShortLinkRepository,
  AbstractUserRepository
} from '../../domain/contracts/repositories';
import { User } from '../../infra/frameworks/database/entities';
import { AwsServiceModule } from '../../infra/services/aws-services/aws-services.modules';
import { BcryptModule } from '../../infra/services/bcrypt/bcrypt.module';
import { DynamoDBShortlinkRepository } from './aws-dynamodb/dynamodb-shortlink.repository';
import { UserRepository } from './user.repository';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    BcryptModule,
    AwsServiceModule
  ],
  providers: [
    {
      provide: AbstractUserRepository,
      useClass: UserRepository
    },
    {
      provide: AbstractShortLinkRepository,
      useClass: DynamoDBShortlinkRepository
    }
  ],
  exports: [AbstractUserRepository, AbstractShortLinkRepository]
})
export class RepositoriesModule {}
