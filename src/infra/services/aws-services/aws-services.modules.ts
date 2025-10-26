import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AbstractKeyValueService } from '../../../application/services';
import { DynamoDBKeyValueService } from './dynamodb-key-value.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AbstractKeyValueService,
      useClass: DynamoDBKeyValueService
    }
  ],
  exports: [AbstractKeyValueService]
})
export class AwsServiceModule {}
