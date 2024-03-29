import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AbstractUrlRepository,
  AbstractUserRepository
} from '../../domain/contracts/repositories';
import { Url, User } from '../../infra/frameworks/database/entities';
import { BcryptModule } from '../../infra/services/bcrypt/bcrypt.module';
import { UrlRepository } from './url.repository';
import { UserRepository } from './user.repository';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Url]), BcryptModule],
  providers: [
    {
      provide: AbstractUserRepository,
      useClass: UserRepository
    },
    {
      provide: AbstractUrlRepository,
      useClass: UrlRepository
    }
  ],
  exports: [AbstractUserRepository, AbstractUrlRepository]
})
export class RepositoriesModule {}
