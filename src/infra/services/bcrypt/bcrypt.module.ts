import { Module } from '@nestjs/common';
import { BcryptService } from './bcrypt.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [BcryptService],
  exports: [BcryptService]
})
export class BcryptModule {}
