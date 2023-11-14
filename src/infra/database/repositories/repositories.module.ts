import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcryptModule } from '../../services/bcrypt/bcrypt.module';
import { Url, User } from '../entities';
import { UrlRepository } from './url.repository';
import { UserRepository } from './user.repository';
import {
  AbstractUrlRepository,
  AbstractUserRepository
} from '../../../domain/contracts/repositories';

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
