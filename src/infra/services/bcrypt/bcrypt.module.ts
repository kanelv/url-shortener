import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BcryptService } from './bcrypt.service';
import { AbstractBcryptService } from '../../../domain/adapters';

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
