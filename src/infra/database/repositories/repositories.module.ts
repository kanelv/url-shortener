import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcryptModule } from '../../services/bcrypt/bcrypt.module';
import { Url, User } from '../entities';
import { UrlRepository } from './url.repository';
import { UserRepository } from './user.repository';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Url]), BcryptModule],
  providers: [UserRepository, UrlRepository],
  exports: [UserRepository, UrlRepository]
})
export class RepositoriesModule {}
