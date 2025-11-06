export abstract class AbstractKeyValueService {
  /**
   * Inserts an item into a key-value store.
   * @param tableName - The name of the table.
   * @param item - The item to insert, must be an object.
   * @param overwrite - If true, allows overwriting existing items; otherwise, prevents overwrites.
   * @throws Error if the operation fails or input validation fails.
   */
  abstract putItem<T extends object>(
    tableName: string,
    item: T,
    overwrite?: boolean
  ): Promise<void>;

  /**
   * Retrieves items from a key-value store based on a query.
   * @param tableName - The name of the table.
   * @param keyConditionExpression - The key condition expression for the query.
   * @param expressionAttributeValues - Values for the key condition expression.
   * @param filterExpression - Optional filter expression to refine results.
   * @param exclusiveStartKey - Optional key for pagination.
   * @returns A promise resolving to an object containing the items and an optional last evaluated key for pagination.
   * @throws Error if the operation fails or input validation fails.
   */
  abstract getItems<T extends object>(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, unknown>,
    filterExpression?: string,
    exclusiveStartKey?: Record<string, unknown>,
    scanIndexForward?: boolean,
    limit?: number,
    indexName?: string
  ): Promise<{ items: T[]; lastEvaluatedKey?: Record<string, unknown> }>;

  /**
   * Updates an item in a key-value store.
   * @param tableName - The name of the table.
   * @param pk - The partition key of the item.
   * @param sk - The sort key of the item.
   * @param updateExpression - The update expression to apply.
   * @param expressionAttributeValues - Values for the update expression.
   * @throws Error if the operation fails or input validation fails.
   */
  abstract updateItem<T extends object>(
    tableName: string,
    pk: string,
    sk: string,
    updateExpression: string,
    expressionAttributeNames: Record<string, string>,
    expressionAttributeValues: Record<string, unknown>
  ): Promise<void>;

  /**
   * Deletes an item from a key-value store.
   * @param tableName - The name of the table.
   * @param pk - The partition key of the item.
   * @param sk - The sort key of the item.
   * @throws Error if the operation fails or input validation fails.
   */
  abstract deleteItem(tableName: string, pk: string, sk: string): Promise<void>;
}
