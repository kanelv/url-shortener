# 📘 API Design Document – URL Shortener Backend

## Overview
This document describes the RESTful API endpoints for the URL Shortener service. The service allows users to shorten URLs, manage their accounts, and track URL usage. Both authenticated users and guests are supported.

---

## 🔐 Authentication

### 1. Sign In
- **Method**: `POST`
- **Endpoint**: `/auth/sign-in`
- **Description**: Sign in using email and password. Returns JWT in session.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "your-password"
  }
  ```
- **Response**:
  ```json
  {
    "accessToken": "jwt.token.here",
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    }
  }
  ```

### 2. Sign Out
- **Method**: `GET`
- **Endpoint**: `/auth/sign-out`
- **Description**: Invalidate the current session.
- **Response**:
  ```json
  {
    "message": "Signed out successfully"
  }
  ```

---

## 👤 User Management

### 3. Create User
- **Method**: `POST`
- **Endpoint**: `/users`
- **Description**: Create a new user account.
- **Request Body**:
  ```json
  {
    "email": "newuser@example.com",
    "password": "secure-password"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "email": "newuser@example.com"
  }
  ```

### 4. List All Users
- **Method**: `GET`
- **Endpoint**: `/users/findAll`
- **Description**: Retrieve a list of all users (admin only).
- **Response**:
  ```json
  [
    {
      "id": "uuid",
      "email": "user1@example.com"
    }
  ]
  ```

### 5. Get User by ID
- **Method**: `GET`
- **Endpoint**: `/users/findOne/:id`
- **Description**: Get a single user by ID.
- **Response**:
  ```json
  {
    "id": "uuid",
    "email": "user@example.com"
  }
  ```

### 6. Update User by ID
- **Method**: `PATCH`
- **Endpoint**: `/users/findOne/:id`
- **Description**: Update a user’s information by ID.
- **Request Body**:
  ```json
  {
    "email": "updated@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "email": "updated@example.com"
  }
  ```

### 7. Delete User
- **Method**: `DELETE`
- **Endpoint**: `/users/:id`
- **Description**: Remove a user account.
- **Response**:
  ```json
  {
    "message": "User deleted successfully"
  }
  ```

---

## 🔗 URL Shortening

### 8. Shorten URL
- **Method**: `POST`
- **Endpoint**: `/urls/shorten`
- **Description**: Generate a short URL from a long one.
- **Request Body**:
  ```json
  {
    "originalUrl": "https://example.com/very/long/url"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "shortCode": "abc123",
    "originalUrl": "https://example.com/very/long/url",
    "createdAt": "2025-04-19T00:00:00Z"
  }
  ```

### 9. List All URLs
- **Method**: `GET`
- **Endpoint**: `/urls`
- **Description**: List all shortened URLs (for user/admin).
- **Response**:
  ```json
  [
    {
      "id": "uuid",
      "shortCode": "abc123",
      "originalUrl": "https://example.com",
      "clicks": 12
    }
  ]
  ```

### 10. Access Shortened URL (Redirect)
- **Method**: `GET`
- **Endpoint**: `/urls/:code`
- **Description**: Redirect to the original URL using the short code.
- **Behavior**: Responds with HTTP 302 to `originalUrl`.

### 11. Get URL by ID
- **Method**: `GET`
- **Endpoint**: `/urls/:id`
- **Description**: Retrieve details of a shortened URL.
- **Response**:
  ```json
  {
    "id": "uuid",
    "shortCode": "abc123",
    "originalUrl": "https://example.com",
    "clicks": 12
  }
  ```

### 12. Delete URL
- **Method**: `DELETE`
- **Endpoint**: `/urls/:id`
- **Description**: Delete a shortened URL.
- **Response**:
  ```json
  {
    "message": "URL deleted successfully"
  }
  ```

---

## 🚦 Rate Limiting

| Type       | Limit                                     |
|------------|-------------------------------------------|
| Guest User | 5 shorten requests per hour per IP        |
| Signed User| 100 shorten requests per day              |
| Abuse      | Block IP after repeated spam attempts     |

---

## ⚠️ Error Handling

All errors follow a consistent JSON structure:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Detailed error message here"
}
```

| Status Code | Description              |
|-------------|--------------------------|
| 400         | Invalid input            |
| 401         | Unauthorized             |
| 403         | Forbidden (no access)    |
| 404         | Resource not found       |
| 429         | Too many requests        |
| 500         | Internal server error    |

---