import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { DynamoDBKeyValueService } from './dynamodb-key-value.service';

// Mock the DynamoDBDocumentClient
const ddbMock = mockClient(DynamoDBDocumentClient);

describe('DynamoDBKeyValueService', () => {
  let service: DynamoDBKeyValueService;
  let configService: ConfigService;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    ddbMock.reset();

    const mockConfigService = {
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        if (key === 'AWS_REGION') return 'us-east-1';
        if (key === 'DYNAMODB_URL') return 'http://localhost:8000';
        throw new Error(`Unexpected config key: ${key}`);
      }),
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'DYNAMODB_URL') return 'http://localhost:8000';
        return undefined;
      })
    };

    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamoDBKeyValueService,
        { provide: ConfigService, useValue: mockConfigService }
      ]
    }).compile();

    service = module.get<DynamoDBKeyValueService>(DynamoDBKeyValueService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('initializeDynamoDBDocumentClient', () => {
    it('should initialize for local dev correctly', () => {
      expect(configService.getOrThrow).toHaveBeenCalledWith('AWS_REGION');
      expect(configService.getOrThrow).toHaveBeenCalledWith('DYNAMODB_URL');
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Initializing DynamoDBDocumentClient')
      );
    });

    it('should warn if DYNAMODB_URL is non-local', () => {
      (configService.get as jest.Mock).mockReturnValueOnce(
        'http://non-local-endpoint:8000'
      );
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');
      new DynamoDBKeyValueService(configService);
      expect(warnSpy).toHaveBeenCalledWith(
        'DYNAMODB_URL is set to a non-local endpoint with dummy credentials'
      );
    });

    it('should throw if AWS_REGION is missing', () => {
      (configService.getOrThrow as jest.Mock).mockImplementationOnce(() => {
        throw new Error('AWS_REGION is required');
      });

      expect(() => new DynamoDBKeyValueService(configService)).toThrow(
        'AWS_REGION is required'
      );
    });
  });

  describe('putItem', () => {
    it('should insert successfully', async () => {
      ddbMock.on(PutCommand).resolves({});
      const item = { PK: 'user#1', SK: 'profile', name: 'John' };

      await service.putItem('TestTable', item);

      expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
        TableName: 'TestTable',
        Item: item,
        ConditionExpression:
          'attribute_not_exists(PK) AND attribute_not_exists(SK)'
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        '✅ Successfully inserted item into table: TestTable'
      );
    });

    it('should insert with overwrite enabled', async () => {
      ddbMock.on(PutCommand).resolves({});
      const item = { PK: 'user#1', SK: 'profile', name: 'John' };
      await service.putItem('TestTable', item, true);

      expect(ddbMock).toHaveReceivedCommandWith(PutCommand, {
        TableName: 'TestTable',
        Item: item
      });
    });

    it('should throw if tableName empty', async () => {
      await expect(service.putItem('', {})).rejects.toThrow(
        'Table name is required'
      );
    });

    it('should throw if item invalid', async () => {
      await expect(service.putItem('TestTable', null as any)).rejects.toThrow(
        'Item must be a valid object'
      );
      await expect(
        service.putItem('TestTable', 'invalid' as any)
      ).rejects.toThrow('Item must be a valid object');
    });

    it('should throw and log on DynamoDB failure', async () => {
      ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'));
      const item = { PK: 'user#1', SK: 'profile' };

      await expect(service.putItem('TestTable', item)).rejects.toThrow(
        'Failed to put item in DynamoDB'
      );
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        `❌ Failed to insert item: ${JSON.stringify(
          item,
          null,
          2
        )} into table: TestTable`
      );
    });
  });

  describe('getItems', () => {
    it('should retrieve successfully', async () => {
      const mockItems = [{ PK: 'user#1', SK: 'profile', name: 'John' }];
      ddbMock.on(QueryCommand).resolves({
        $metadata: { httpStatusCode: 200 },
        Items: mockItems
      });

      const result = await service.getItems(
        'TestTable',
        'PK = :pk',
        { ':pk': 'user#1' },
        'name = :name',
        { PK: 'user#1', SK: 'profile' }
      );

      expect(result).toEqual({ items: mockItems, lastEvaluatedKey: undefined });
      expect(loggerSpy).toHaveBeenCalledWith(
        'Retrieved 1 items from table TestTable'
      );
    });

    it('should return empty list and log', async () => {
      ddbMock.on(QueryCommand).resolves({
        $metadata: { httpStatusCode: 200 },
        Items: [],
        LastEvaluatedKey: { PK: 'u#1', SK: 'p#2' }
      });

      const result = await service.getItems('TestTable', 'PK = :pk', {
        ':pk': 'user#1'
      });

      expect(result.items).toEqual([]);
      expect(loggerSpy).toHaveBeenCalledWith(
        'No items found in table TestTable for query'
      );
    });

    it('should throw validation errors', async () => {
      await expect(service.getItems('', 'x', {})).rejects.toThrow(
        'Table name is required'
      );
      await expect(service.getItems('t', '', {})).rejects.toThrow(
        'Key condition expression is required'
      );
      await expect(service.getItems('t', 'x', null as any)).rejects.toThrow(
        'Expression attribute values must be a valid object'
      );
    });

    it('should throw on non-200 DynamoDB response', async () => {
      ddbMock.on(QueryCommand).resolves({ $metadata: { httpStatusCode: 400 } });
      await expect(
        service.getItems('TestTable', 'PK = :pk', { ':pk': 'user#1' })
      ).rejects.toThrow('Failed to query items in DynamoDB');
    });

    it('should throw and log on DynamoDB failure', async () => {
      ddbMock.on(QueryCommand).rejects(new Error('DynamoDB error'));
      await expect(
        service.getItems('TestTable', 'PK = :pk', { ':pk': 'user#1' })
      ).rejects.toThrow('Failed to query items in DynamoDB');
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        '❌ Query failed for table TestTable: Error: DynamoDB error'
      );
    });
  });

  describe('updateItem', () => {
    it('should update successfully', async () => {
      ddbMock.on(UpdateCommand).resolves({});
      await service.updateItem(
        'TestTable',
        'user#1',
        'profile',
        'SET #n = :name',
        { '#n': 'name' },
        { ':name': 'John' }
      );

      expect(ddbMock).toHaveReceivedCommandWith(UpdateCommand, {
        TableName: 'TestTable',
        Key: { PK: 'user#1', SK: 'profile' },
        UpdateExpression: 'SET #n = :name',
        ExpressionAttributeNames: { '#n': 'name' },
        ExpressionAttributeValues: { ':name': 'John' },
        ReturnValues: 'UPDATED_NEW'
      });
    });

    it('should throw if missing params', async () => {
      await expect(
        service.updateItem('', 'p', 's', 'x', {}, {})
      ).rejects.toThrow('Table name is required');
      await expect(
        service.updateItem('t', '', 's', 'x', {}, {})
      ).rejects.toThrow('Partition key and sort key are required');
      await expect(
        service.updateItem('t', 'p', '', 'x', {}, {})
      ).rejects.toThrow('Partition key and sort key are required');
      await expect(
        service.updateItem('t', 'p', 's', '', {}, {})
      ).rejects.toThrow('Update expression is required');
      await expect(
        service.updateItem('t', 'p', 's', 'SET a=:a', {}, null as any)
      ).rejects.toThrow('Expression attribute values must be a valid object');
    });

    it('should throw and log on DynamoDB failure', async () => {
      ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB error'));
      await expect(
        service.updateItem(
          'TestTable',
          'user#1',
          'profile',
          'SET #n = :name',
          { '#n': 'name' },
          { ':name': 'John' }
        )
      ).rejects.toThrow('Failed to update item in DynamoDB');
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        '❌ Failed to update item in table TestTable with PK: user#1, SK: profile: Error: DynamoDB error'
      );
    });
  });

  describe('deleteItem', () => {
    it('should delete successfully', async () => {
      ddbMock.on(DeleteCommand).resolves({});
      await service.deleteItem('TestTable', 'user#1', 'profile');

      expect(ddbMock).toHaveReceivedCommandWith(DeleteCommand, {
        TableName: 'TestTable',
        Key: { PK: 'user#1', SK: 'profile' }
      });
      expect(loggerSpy).toHaveBeenCalledWith(
        '✅ Successfully deleted item from table TestTable with PK: user#1, SK: profile'
      );
    });

    it('should throw validation errors', async () => {
      await expect(service.deleteItem('', 'a', 'b')).rejects.toThrow(
        'Table name is required'
      );
      await expect(service.deleteItem('t', '', 'b')).rejects.toThrow(
        'Partition key and sort key are required'
      );
      await expect(service.deleteItem('t', 'a', '')).rejects.toThrow(
        'Partition key and sort key are required'
      );
    });

    it('should throw and log on DynamoDB failure', async () => {
      ddbMock.on(DeleteCommand).rejects(new Error('DynamoDB error'));
      await expect(
        service.deleteItem('TestTable', 'user#1', 'profile')
      ).rejects.toThrow('Failed to delete item in DynamoDB');
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        '❌ Failed to delete item from table TestTable with PK: user#1, SK: profile: Error: DynamoDB error'
      );
    });
  });
});
