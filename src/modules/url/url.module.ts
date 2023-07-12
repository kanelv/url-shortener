import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlController } from './url.controller';
import { Url } from './url.entity';
import { UrlRepository } from './url.repository';
import { UrlService } from './url.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Url])],
  providers: [UrlRepository, UrlService],
  controllers: [UrlRepository, UrlController]
})
export class UrlModule {}
