import { AbstractKeyValueService } from '@/application/services';
import {
  AbstractShortLinkRepository,
  CreateOneShortLink,
  FindOneShortLink,
  FindShortLink
} from '@/domain/contracts/repositories';
import { ShortLinkEntity } from '@/domain/entities';
import { Roles } from '@/ia/guards/role.decorator';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

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
        SK: `shortlink#${now.unix()}#${shortCode}`,
        GSI1PK: `shortcode#${shortCode}`,
        GSI1SK: `user#${createOneShortLink.userId}`,
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

  async findAll(findShortLink?: FindShortLink): Promise<{
    items: ShortLinkEntity[];
    nextPageToken?: string;
  }> {
    this.logger.log(
      `findAll::findShortLink: ${JSON.stringify(findShortLink, null, 2)}`
    );

    const tableName = String(
      this.configService.get<string>('DYNAMO_DB_TABLE_NAME') ?? 'ShortLink'
    );

    // Decode nextPageToken to exclusiveStartKey
    let exclusiveStartKey: Record<string, unknown> | undefined;
    if (findShortLink?.nextPageToken) {
      try {
        const decoded = Buffer.from(
          findShortLink.nextPageToken,
          'base64'
        ).toString('utf-8');
        exclusiveStartKey = JSON.parse(decoded);
      } catch (error) {
        this.logger.error('Invalid nextPageToken', error);
        throw new Error('Invalid pagination token');
      }
    }

    // Query
    const keyConditionExpression: string =
      'PK = :pk AND begins_with(SK, :prefix)';

    const expressionAttributeValues = findShortLink?.userId
      ? {
          ':pk': `user#${findShortLink.userId}`,
          ':prefix': 'shortlink#'
        }
      : {
          ':pk': `user#guest`,
          ':prefix': 'shortlink#'
        };

    const limit = findShortLink?.limit ?? 10;

    if (findShortLink?.active) {
      expressionAttributeValues[':status'] = true;
      const filterExpression: string = 'status = :status';

      const result = await this.keyValueService.getItems(
        tableName,
        keyConditionExpression,
        expressionAttributeValues,
        filterExpression,
        exclusiveStartKey,
        false,
        limit
      );

      // Encode lastEvaluatedKey to nextPageToken
      const nextPageToken = result.lastEvaluatedKey
        ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString(
            'base64'
          )
        : undefined;

      return {
        items: result.items as ShortLinkEntity[],
        nextPageToken
      };
    }

    const result = await this.keyValueService.getItems(
      tableName,
      keyConditionExpression,
      expressionAttributeValues,
      undefined,
      exclusiveStartKey,
      false,
      limit
    );

    this.logger.log(`findAll::result: ${JSON.stringify(result, null, 2)}`);

    // Encode lastEvaluatedKey to nextPageToken
    const nextPageToken = result.lastEvaluatedKey
      ? Buffer.from(JSON.stringify(result.lastEvaluatedKey)).toString('base64')
      : undefined;

    return {
      items: result.items as ShortLinkEntity[],
      nextPageToken
    };
  }

  async findOneBy(
    findOneShortLink: FindOneShortLink
  ): Promise<ShortLinkEntity> {
    const { shortCode, userId } = findOneShortLink;

    const tableName = String(
      this.configService.get<string>('DYNAMO_DB_TABLE_NAME') ?? 'ShortLink'
    );

    // Query via GSI
    const indexName = 'GSI1';
    const keyConditionExpression = 'GSI1PK = :gsiPk AND GSI1SK = :gsiSk';
    const expressionAttributeValues = {
      ':gsiPk': `shortcode#${shortCode}`,
      ':gsiSk': `user#${userId}`
    };

    try {
      // Log the query execution attempt
      this.logger.log(
        `Querying GSI to find shortlink for userId=${userId}, shortCode=${shortCode}`
      );

      const result = await this.keyValueService.getItems<ShortLinkEntity>(
        tableName,
        keyConditionExpression,
        expressionAttributeValues,
        undefined, // no filter
        undefined, // no pagination
        false, // latest first
        10,
        indexName
      );

      // Check if the result is empty
      if (!result || result.items.length === 0) {
        this.logger.warn(
          `No short link found via GSI for userId=${userId} and shortCode=${shortCode}`
        );
        throw new NotFoundException(
          `ShortLink not found for the shortCode: ${shortCode}`
        );
      }

      // Return the first (and hopefully only) result
      return result.items[0] as ShortLinkEntity;
    } catch (error) {
      // Log the error for troubleshooting
      this.logger.error(
        `Error fetching via GSI for userId=${userId}, shortCode=${shortCode}: ${error.message}`,
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
      )} - updates: ${JSON.stringify(updates, null, 2)}`
    );

    const tableName = String(
      this.configService.get<string>('DYNAMO_DB_TABLE_NAME') ?? 'ShortLink'
    );

    // First, find the item using GSI to get the correct PK and SK
    const existingItem = await this.findOneBy(findOneShortLink);

    if (!existingItem) {
      throw new NotFoundException(
        `ShortLink not found for shortCode: ${findOneShortLink.shortCode}`
      );
    }

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
          Key: { PK: existingItem.PK, SK: existingItem.SK },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW'
        })
      );

      return result.Attributes as ShortLinkEntity;
    } catch (error) {
      this.logger.error(
        `Failed to update shortlink ${existingItem.SK}: ${error.message}`,
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

    const tableName = String(
      this.configService.get<string>('DYNAMO_DB_TABLE_NAME') ?? 'ShortLink'
    );

    // First, find the item using GSI to get the correct PK and SK
    try {
      const existingItem = await this.findOneBy(findOneShortLink);

      if (!existingItem) {
        this.logger.warn(
          `No shortlink found to delete for shortCode: ${findOneShortLink.shortCode}`
        );
        throw new NotFoundException(
          `ShortLink not found: ${findOneShortLink.shortCode}`
        );
      }

      await this.keyValueService.deleteItem(
        tableName,
        existingItem.PK,
        existingItem.SK
      );
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
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

    try {
      const item = await this.findOneBy(findOneShortLink);
      return !!item;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false;
      }
      this.logger.error(
        `Error checking existence: ${error.message}`,
        error.stack
      );
      return false;
    }
  }
}
