#!/usr/bin/env bash
# awslocal dynamodb create-table \
#    --table-name SampleTable \
#     --attribute-definitions \
#     	AttributeName=partitionKey,AttributeType=N \
# 			AttributeName=sortKey,AttributeType=N \
#     --key-schema \
#     	AttributeName=partitionKey,KeyType=HASH \
#     	AttributeName=sortKey,KeyType=RANGE \
#     --provisioned-throughput \
#     	ReadCapacityUnits=5,WriteCapacityUnits=5

awslocal dynamodb create-table \
   --table-name ShortLink \
    --attribute-definitions \
    	AttributeName=PK,AttributeType=S \
			AttributeName=SK,AttributeType=S \
    --key-schema \
    	AttributeName=PK,KeyType=HASH \
			AttributeName=SK,KeyType=RANGE \
    --provisioned-throughput \
    	ReadCapacityUnits=5,WriteCapacityUnits=5

awslocal dynamodb update-time-to-live \
  --table-name ShortLink \
  --time-to-live-specification "Enabled=true, AttributeName=expiresAt"
