# Authentication

## To handle your scenario where:

- use **BasicAuthGuard** for initial authentication to obtain an access token.
- use **JwtAuthGuard** for all subsequent authenticated requests using the access token.

## Details:

- **BasicAuthGuard**: Used to validate credentials (like username and password) and issue an access token.
- **JwtAuthGuard**: Used for verifying the access token for all other routes.