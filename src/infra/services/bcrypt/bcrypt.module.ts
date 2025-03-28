import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AbstractBcryptService } from '../../../domain/services';
import { BcryptService } from './bcrypt.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AbstractBcryptService,
      useClass: BcryptService
    }
  ],
  exports: [AbstractBcryptService]
})
export class BcryptModule {}
