import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UrlModule } from './modules/url/url.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './modules/url/url.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'URL.sqlite',
      entities: [Url],
      synchronize: true
    }),
    UrlModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
