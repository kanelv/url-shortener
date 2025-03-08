## 1. SQL Injection
### Using bind variables

// TODO It will be described once the specific framework is decided.

### SQL setup

The function that directly builds the character string obtained from the input parameter to the WEB application and builds SQL is not allowed.
Use the query builder provided by the framework as much as possible.

// TODO It will be described once the specific framework is decided.

### Error Message
It is not allowed to directly return the error message of database product or database framework as a response.

// TODO Described common error handlers

### Database Account
Do not allow users of the database used in the WEB application to execute DDL.

// TODO Describe migration framework and DB framework.
