import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { AbstractKeyValueService } from '../../../application/services';
import {
  AbstractShortLinkRepository,
  CreateOneShortLink,
  FindOneShortLink,
  FindShortLink
} from '../../../domain/contracts/repositories';
import { ShortLinkEntity } from '../../../domain/entities/shortlink.entity';
import { Roles } from '../../guards/role.decorator';

@Injectable()
export class DynamoDBShortlinkRepository
  implements AbstractShortLinkRepository
{
  private readonly logger = new Logger(DynamoDBShortlinkRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly keyValueService: AbstractKeyValueService
  ) {}

  @Roles()
  async create(
    createOneShortLink: CreateOneShortLink
  ): Promise<ShortLinkEntity> {
    const maxRetries = Number(
      this.configService.get<string>('MAX_RETRIES') ?? '5'
    );

    const now = dayjs();
    const shortLinkExpireDurationByDay = Number(
      this.configService.get<string>('SHORTLINK_EXPIRE_DURATION_BY_DAY') ?? '3'
    );

    const expiresAt: number = now
      .add(shortLinkExpireDurationByDay, 'day')
      .valueOf();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const shortCode = nanoid(10);

      const shortLinkItem: ShortLinkEntity = {
        PK: `user#${createOneShortLink.userId}`,
        SK: `shortlink#${now.unix()}${shortCode}`,
        originalUrl: createOneShortLink.originalUrl,
        shortCode: shortCode,
        clicks: 0,
        expiresAt: expiresAt,
        status: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      try {
        const tableName = String(
          this.configService.get<string>('DYNAMO_DB_TABLE_NAME') ?? 'ShortLink'
        );

        await this.keyValueService.putItem(tableName, shortLinkItem);

        this.logger.log(
          `create::shortLinkItem ${JSON.stringify(shortLinkItem, null, 2)}`
        );

        return shortLinkItem; // ✅ Success!
      } catch (error) {
        if (error instanceof ConditionalCheckFailedException) {
          // ❗ Collision happened, retry
          this.logger.warn(
            `Collision detected, retrying (${attempt + 1}/${maxRetries})...`
          );
          continue;
        }
        // Other unknown error => throw immediately
        throw error;
      }
    }

    // ❌ All retries failed
    throw new Error(
      'Failed to create unique shortlink after multiple attempts.'
    );
  }

  async findAll(findShortLink?: FindShortLink): Promise<ShortLinkEntity[]> {
    this.logger.log(
      `findAll::findShortLink: ${JSON.stringify(findShortLink, null, 2)}`
    );

    const keyConditionExpression: string =
      'PK = :pk AND begins_with(SK, :prefix)';
    const tableName = String(
      this.configService.get<string>('DYNAMO_DB_TABLE_NAME') ?? 'ShortLink'
    );

    const expressionAttributeValues = findShortLink?.userId
      ? {
          ':pk': `user#${findShortLink.userId}`,
          ':prefix': 'shortlink#'
        }
      : {
          ':pk': `user#guest`,
          ':prefix': 'shortlink#'
        };

    if (findShortLink?.active) {
      expressionAttributeValues[':status'] = true;
      const filterExpression: string = 'status = :status';

      const result = await this.keyValueService.getItems(
        tableName,
        keyConditionExpression,
        expressionAttributeValues,
        filterExpression
      );
      return result.items as ShortLinkEntity[];
    }

    const result = await this.keyValueService.getItems(
      tableName,
      keyConditionExpression,
      expressionAttributeValues
    );

    return result.items as ShortLinkEntity[];
  }

  async findOneBy(
    findOneShortLink: FindOneShortLink
  ): Promise<ShortLinkEntity> {
    // Prepare the query conditions
    const keyConditionExpression: string = 'PK = :pk AND SK = :sk)';
    const expressionAttributeValues = {
      ':pk': `user#${findOneShortLink.userId}`,
      ':prefix': `shortlink#${findOneShortLink.shortCode}`
    };

    // Get table name from config
    const tableName = String(
      this.configService.get<string>('DYNAMO_DB_TABLE_NAME') ?? 'ShortLink'
    );

    try {
      // Log the query execution attempt
      this.logger.log(
        `Executing query to find short link for userId: ${findOneShortLink.userId} and shortCode: ${findOneShortLink.shortCode}`
      );

      // Fetch items from the key-value store
      const shortLinks = await this.keyValueService.getItems(
        tableName,
        keyConditionExpression,
        expressionAttributeValues
      );

      // Check if the result is empty
      if (!shortLinks || shortLinks.items.length === 0) {
        this.logger.warn(
          `No short link found for userId: ${findOneShortLink.userId} and shortCode: ${findOneShortLink.shortCode}`
        );
        throw new NotFoundException(
          `ShortLink not found for the shortCode: ${findOneShortLink.shortCode}`
        );
      }

      // Return the first (and hopefully only) result
      return shortLinks.items[0] as ShortLinkEntity;
    } catch (error) {
      // Log the error for troubleshooting
      this.logger.error(
        `Error while fetching short link: ${error.message}`,
        error.stack
      );
      throw error; // Propagate the error for higher-level handling
    }
  }

  async updateOne(
    findOneShortLink: FindOneShortLink,
    updates: Partial<ShortLinkEntity>
  ): Promise<ShortLinkEntity> {
    this.logger.debug(
      `updateOne::findOneShortLink: ${JSON.stringify(
        findOneShortLink,
        null,
        2
      )} - updates: ${updates}`
    );

    const tableName = String(
      this.configService.get<string>('DYNAMO_DB_TABLE_NAME') ?? 'ShortLink'
    );

    const pk = `user#${findOneShortLink.userId}`;
    const sk = `shortlink#${findOneShortLink.shortCode}`;

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('No update fields provided.');
    }

    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    for (const [key, value] of Object.entries(updates)) {
      const attributeName = `#${key}`;
      const attributeValue = `:${key}`;
      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value;
    }

    const updateExpression = 'SET ' + updateExpressions.join(', ');

    try {
      const result = await this.keyValueService['client'].send(
        new UpdateCommand({
          TableName: tableName,
          Key: { PK: pk, SK: sk },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW'
        })
      );

      return result.Attributes as ShortLinkEntity;
    } catch (error) {
      this.logger.error(
        `Failed to update shortlink ${sk}: ${error.message}`,
        error.stack
      );
      throw new Error('Failed to update!');
    }
  }

  async deleteOne(findOneShortLink: FindOneShortLink): Promise<boolean> {
    this.logger.debug(
      `deleteOne::findOneShortLink: ${JSON.stringify(
        findOneShortLink,
        null,
        2
      )}`
    );

    // Get table name from config
    const tableName = String(
      this.configService.get<string>('DYNAMO_DB_TABLE_NAME') ?? 'ShortLink'
    );

    const pk = `user#${findOneShortLink.userId}`;
    const sk = `shortlink#${findOneShortLink.shortCode}`;

    // Check existence
    const existingItems = await this.keyValueService.getItems<ShortLinkEntity>(
      tableName,
      'PK = :pk AND SK = :sk',
      {
        ':pk': pk,
        ':sk': sk
      }
    );

    if (!existingItems || existingItems.items.length === 0) {
      this.logger.warn(`No shortlink found to delete: PK=${pk}, SK=${sk}`);
      throw new NotFoundException(`ShortLink not found: ${sk}`);
    }

    try {
      await this.keyValueService.deleteItem(tableName, pk, sk);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to delete shortlink: ${error.message}`,
        error.stack
      );
      return false;
    }
  }

  async isExist(findOneShortLink: FindOneShortLink): Promise<boolean> {
    this.logger.debug(
      `isExist::findOneShortLink: ${JSON.stringify(findOneShortLink, null, 2)}`
    );

    // Get table name from config
    const tableName = String(
      this.configService.get<string>('DYNAMO_DB_TABLE_NAME') ?? 'ShortLink'
    );

    const pk = `user#${findOneShortLink.userId}`;
    const sk = `shortlink#${findOneShortLink.shortCode}`;

    // Check existence
    const existingItems = await this.keyValueService.getItems<ShortLinkEntity>(
      tableName,
      'PK = :pk AND SK = :sk',
      {
        ':pk': pk,
        ':sk': sk
      }
    );

    if (!existingItems || existingItems.items.length === 0) {
      this.logger.warn(`No shortlink found to delete: PK=${pk}, SK=${sk}`);
      return false;
    }

    return true;
  }
}
