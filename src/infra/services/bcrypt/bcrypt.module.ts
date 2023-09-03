import { Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'IBcryptService',
      useClass: BcryptService
    }
  ],
  exports: [
    {
      provide: 'IBcryptService',
      useClass: BcryptService
    }
  ]
})
export class BcryptModule {}
