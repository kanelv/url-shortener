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
  exports: ['IBcryptService']
})
export class BcryptModule {}
