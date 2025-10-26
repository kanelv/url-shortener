Frontend (React/Vue/etc)
        |
        v
API Gateway (optional)
        |
        v
   Backend (NestJS/Express/etc)
   ├── PostgreSQL: users, auth, sessions
   └── DynamoDB: short links (code → URL)


# Refactor Plan

## 1. DynamoDB Table – short_links
You’ll store short links here. Each item has:

A partition key of user#<user_id> → groups links by user.

A sort key of the shortCode.

Other attributes like originalUrl, clicks, expiredAt, etc.

📦 Example Item in DynamoDB
```bash
{
  "PK": "user#15",
  "SK": "abcd123",
  "originalUrl": "https://google.com",
  "clicks": 0,
  "expiredAt": 1715692800, // UNIX timestamp for TTL
  "status": true,
  "createdAt": "2025-04-21T00:00:00Z"
}
```

## 2. Backend Logic
### 2.1 When user creates a new short link:
1. Authenticated → get user.id from JWT/session
2. Generate shortCode
3. Save to DynamoDB with:
- PK: user#${user.id}
- SK: shortCode
- Include TTL (expiredAt), status, etc.

### 2.2 When user fetches their short links:
1. Query DynamoDB: PK = user#${user.id}

### 2.3 When resolving a short URL (/abcd123):
- Query a Global Secondary Index on SK = shortCode
- Return the original URL


## 3. DynamoDB Setup (1 Table + 1 GSI)

Attribute Name	Use
PK	            Partition Key (user#id)
SK	            Sort Key (shortCode)
GSI1PK	        For fast URL resolution

Optional: Add GSI to look up by just the shortCode.

