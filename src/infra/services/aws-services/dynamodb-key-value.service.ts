import { DynamoDBClient, QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AbstractKeyValueService } from '../../../application/services';

@Injectable()
export class DynamoDBKeyValueService implements AbstractKeyValueService {
  private readonly logger = new Logger(DynamoDBKeyValueService.name);
  private readonly dynamoDb: DynamoDBDocumentClient;

  constructor(private readonly configService: ConfigService) {
    this.dynamoDb = this.initializeDynamoDBDocumentClient();
  }

  /**
   * Initializes the DynamoDBDocumentClient for Lambda or local development.
   * @returns A configured DynamoDBDocumentClient instance.
   * @throws Error if required configuration is missing or invalid.
   */
  private initializeDynamoDBDocumentClient(): DynamoDBDocumentClient {
    const isLambda = !!process.env.AWS_EXECUTION_ENV;
    const region = this.configService.getOrThrow('AWS_REGION');

    if (!region) {
      this.logger.error('AWS_REGION is not defined');
      throw new InternalServerErrorException('AWS_REGION is required');
    }

    const dynamoClient: DynamoDBClient = new DynamoDBClient(
      isLambda
        ? { region }
        : {
            endpoint: this.configService.getOrThrow('DYNAMODB_URL'),
            region: this.configService.getOrThrow('AWS_REGION'),
            credentials: {
              accessKeyId: 'dummy',
              secretAccessKey: 'dummy'
            }
          }
    );

    if (
      !isLambda &&
      !this.configService.get('DYNAMODB_URL')?.includes('localhost')
    ) {
      this.logger.warn(
        'DYNAMODB_URL is set to a non-local endpoint with dummy credentials'
      );
    }

    this.logger.log(
      `Initializing DynamoDBDocumentClient for ${
        isLambda ? 'Lambda' : 'local dev'
      }`
    );
    return DynamoDBDocumentClient.from(dynamoClient);
  }

  /**
   * Inserts an item into a DynamoDB table.
   * @param tableName - The name of the DynamoDB table.
   * @param item - The item to insert, must be an object.
   * @param overwrite - If true, allows overwriting existing items; otherwise, prevents overwrites.
   * @throws InternalServerErrorException if the operation fails or input validation fails.
   */
  async putItem<T extends object>(
    tableName: string,
    item: T,
    overwrite: boolean = false
  ): Promise<void> {
    if (!tableName)
      throw new InternalServerErrorException('Table name is required');
    if (!item || typeof item !== 'object')
      throw new InternalServerErrorException('Item must be a valid object');

    const putCommand = new PutCommand({
      TableName: tableName,
      Item: item,
      ConditionExpression:
        'attribute_not_exists(PK) AND attribute_not_exists(SK)',
      ...(overwrite
        ? {}
        : {
            ConditionExpression:
              'attribute_not_exists(PK) AND attribute_not_exists(SK)'
          })
    });

    try {
      await this.dynamoDb.send(putCommand);
      this.logger.log(`Item: ${JSON.stringify(item, null, 2)}`);
      this.logger.log(`✅ Successfully inserted item into table: ${tableName}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to insert item: ${JSON.stringify(
          item,
          null,
          2
        )} into table: ${tableName}`
      );
      throw new InternalServerErrorException('Failed to put item in DynamoDB');
    }
  }

  /**
   * Retrieves items from a DynamoDB table based on a query.
   * @param tableName - The name of the DynamoDB table.
   * @param keyConditionExpression - The key condition expression for the query.
   * @param expressionAttributeValues - Values for the key condition expression.
   * @param filterExpression - Optional filter expression to refine results.
   * @param exclusiveStartKey - Optional key for pagination.
   * @returns A promise resolving to an object containing the items and an optional last evaluated key.
   * @throws InternalServerErrorException if the operation fails or input validation fails.
   */
  async getItems<T extends object>(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, unknown>,
    filterExpression?: string,
    exclusiveStartKey?: Record<string, unknown>,
    scanIndexForward: boolean = false,
    limit: number = 10
  ): Promise<{ items: T[]; lastEvaluatedKey?: Record<string, unknown> }> {
    if (!tableName)
      throw new InternalServerErrorException('Table name is required');
    if (!keyConditionExpression)
      throw new InternalServerErrorException(
        'Key condition expression is required'
      );
    if (
      !expressionAttributeValues ||
      typeof expressionAttributeValues !== 'object'
    ) {
      throw new InternalServerErrorException(
        'Expression attribute values must be a valid object'
      );
    }

    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ...(filterExpression && { FilterExpression: filterExpression }),
      ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
      ScanIndexForward: scanIndexForward, // false = descending order (newest first)
      Limit: limit // optional: limit number of result
    });

    try {
      const result: QueryCommandOutput = await this.dynamoDb.send(command);

      if (result.$metadata.httpStatusCode !== 200) {
        throw new Error(
          `DynamoDB returned status ${result.$metadata.httpStatusCode}`
        );
      }

      const items = (result.Items ?? []) as T[];

      if (items.length === 0) {
        this.logger.log(`No items found in table ${tableName} for query`);
      } else {
        this.logger.log(
          `Retrieved ${items.length} items from table ${tableName}`
        );
      }

      return { items, lastEvaluatedKey: result.LastEvaluatedKey };
    } catch (error) {
      this.logger.error(`❌ Query failed for table ${tableName}: ${error}`);
      throw new InternalServerErrorException(
        'Failed to query items in DynamoDB'
      );
    }
  }

  /**
   * Updates an item in a DynamoDB table.
   * @param tableName - The name of the DynamoDB table.
   * @param pk - The partition key of the item.
   * @param sk - The sort key of the item.
   * @param updateExpression - The update expression to apply.
   * @param expressionAttributeValues - Values for the update expression.
   * @throws InternalServerErrorException if the operation fails or input validation fails.
   */
  async updateItem<T extends object>(
    tableName: string,
    pk: string,
    sk: string,
    updateExpression: string,
    expressionAttributeNames: Record<string, string>,
    expressionAttributeValues: Record<string, unknown>
  ): Promise<void> {
    if (!tableName)
      throw new InternalServerErrorException('Table name is required');
    if (!pk || !sk)
      throw new InternalServerErrorException(
        'Partition key and sort key are required'
      );
    if (!updateExpression)
      throw new InternalServerErrorException('Update expression is required');
    if (
      !expressionAttributeValues ||
      typeof expressionAttributeValues !== 'object'
    ) {
      throw new InternalServerErrorException(
        'Expression attribute values must be a valid object'
      );
    }

    try {
      await this.dynamoDb.send(
        new UpdateCommand({
          TableName: tableName,
          Key: {
            PK: pk,
            SK: sk
          },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'UPDATED_NEW'
        })
      );
      this.logger.log(
        `✅ Successfully updated item in table ${tableName} with PK: ${pk}, SK: ${sk}`
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to update item in table ${tableName} with PK: ${pk}, SK: ${sk}: ${error}`
      );
      throw new InternalServerErrorException(
        'Failed to update item in DynamoDB'
      );
    }
  }

  /**
   * Deletes an item from a DynamoDB table.
   * @param tableName - The name of the DynamoDB table.
   * @param pk - The partition key of the item.
   * @param sk - The sort key of the item.
   * @throws InternalServerErrorException if the operation fails or input validation fails.
   */
  async deleteItem(tableName: string, pk: string, sk: string): Promise<void> {
    if (!tableName)
      throw new InternalServerErrorException('Table name is required');
    if (!pk || !sk)
      throw new InternalServerErrorException(
        'Partition key and sort key are required'
      );

    try {
      await this.dynamoDb.send(
        new DeleteCommand({
          TableName: tableName,
          Key: {
            PK: pk,
            SK: sk
          }
        })
      );
      this.logger.log(
        `✅ Successfully deleted item from table ${tableName} with PK: ${pk}, SK: ${sk}`
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to delete item from table ${tableName} with PK: ${pk}, SK: ${sk}: ${error}`
      );
      throw new InternalServerErrorException(
        'Failed to delete item in DynamoDB'
      );
    }
  }
}
