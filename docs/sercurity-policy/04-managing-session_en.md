## 4. Poor session management
### Session ID numbering method
// TODO Will write once decided

The session ID adopts a method in which the value changes with each issue.

### Session ID Management
The session ID that communicates by HTTPS is managed by Cookie and the secure attribute is added. Implementation that assigns session ID to URL parameter is not allowed.
Be sure to use different session before login and after login.
Also, the session ID has an expiration date.

// TODO Write about common functions

### Screen transition
In the function that renders the screen on the server side and transitions the screen, check the value using a dynamic token other than session ID.

// TODO Write about the functions provided by NestJS


