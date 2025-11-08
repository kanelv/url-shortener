import { DynamoDBClient, ScanCommand, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';

/**
 * Clears all items from a DynamoDB table
 * Useful for cleaning up test data between e2e test runs
 */
export async function clearDynamoDBTable(tableName: string): Promise<void> {
  const client = new DynamoDBClient({
    endpoint: process.env.DYNAMODB_URL || 'http://localhost:4566',
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy'
    }
  });

  try {
    // Scan the table to get all items
    const scanResult = await client.send(
      new ScanCommand({
        TableName: tableName,
        ProjectionExpression: 'PK, SK' // Only fetch keys, not full items
      })
    );

    if (!scanResult.Items || scanResult.Items.length === 0) {
      console.log(`Table ${tableName} is already empty`);
      return;
    }

    // Batch delete items (max 25 per batch)
    const batchSize = 25;
    for (let i = 0; i < scanResult.Items.length; i += batchSize) {
      const batch = scanResult.Items.slice(i, i + batchSize);

      await client.send(
        new BatchWriteItemCommand({
          RequestItems: {
            [tableName]: batch.map((item) => ({
              DeleteRequest: {
                Key: {
                  PK: item.PK,
                  SK: item.SK
                }
              }
            }))
          }
        })
      );
    }

    console.log(`Cleared ${scanResult.Items.length} items from table ${tableName}`);
  } catch (error) {
    console.error(`Failed to clear table ${tableName}:`, error);
    throw error;
  } finally {
    client.destroy();
  }
}
