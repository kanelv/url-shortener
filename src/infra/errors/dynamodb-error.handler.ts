import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnauthorizedException
} from '@nestjs/common';

/**
 * Centralized DynamoDB error handler for AWS SDK v3
 */
export class DynamoDBErrorHandler {
  static handle(error: unknown): never {
    if (error instanceof ConditionalCheckFailedException) {
      throw new ConflictException(
        'Item already exists or conditional write failed'
      );
    }

    if (isAWSError(error)) {
      const { name, message } = error;

      switch (name) {
        case 'AccessDeniedException':
          throw new ForbiddenException('Access denied to DynamoDB');
        case 'ProvisionedThroughputExceededException':
        case 'ThrottlingException':
          throw new ServiceUnavailableException(
            'DynamoDB is throttling requests'
          );
        case 'UnrecognizedClientException':
          throw new UnauthorizedException('Invalid AWS credentials');
        case 'ResourceNotFoundException':
          throw new InternalServerErrorException('DynamoDB table not found');
        default:
          throw new InternalServerErrorException(`DynamoDB Error: ${message}`);
      }
    }

    // Unexpected error fallback
    throw new InternalServerErrorException(
      'Unexpected error while interacting with DynamoDB'
    );
  }
}

function isAWSError(error: any): error is { name: string; message: string } {
  return typeof error?.name === 'string' && typeof error?.message === 'string';
}
