#!/usr/bin/env bash

# Create DynamoDB table with GSI
awslocal dynamodb create-table \
   --table-name ShortLink \
    --attribute-definitions \
    	AttributeName=PK,AttributeType=S \
			AttributeName=SK,AttributeType=S \
      AttributeName=GSI1PK,AttributeType=S \
      AttributeName=GSI1SK,AttributeType=S \
    --key-schema \
    	AttributeName=PK,KeyType=HASH \
			AttributeName=SK,KeyType=RANGE \
    --global-secondary-indexes '[
      {
        "IndexName": "GSI1",
        "KeySchema": [
          {"AttributeName": "GSI1PK", "KeyType": "HASH"},
          {"AttributeName": "GSI1SK", "KeyType": "RANGE"}
        ],
        "Projection": {"ProjectionType": "ALL"},
        "ProvisionedThroughput": {"ReadCapacityUnits": 5, "WriteCapacityUnits": 5}
      }
    ]' \
    --provisioned-throughput \
    	ReadCapacityUnits=5,WriteCapacityUnits=5

# Enable TTL (for expiration)
awslocal dynamodb update-time-to-live \
  --table-name ShortLink \
  --time-to-live-specification "Enabled=true, AttributeName=expiresAt"
