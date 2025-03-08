## 5. Cross-site scripting
### Escape processing
Items that are output dynamically must be escaped.

### Input check
In order to avoid mixing scripts, input that does not start with a character string (`<script> </ script>`) or `http: //` or `https: //` that generates a script tag is not accepted.

// TODO Write about common input check

### Style sheet
Do not use style sheets from external sites.

### Response header
- Be sure to specify the character code (UTF-8) in the Content-Type header.
- When using Cookie, specify HttpOnly attribute.
- Specify the following headers in the function that returns HTML screen as a response.
  - `X-XSS-Protection: 1; mode=block`
  - `Content-Security-Policy`
    - Content Security Policy adopts the nonce method.

// TODO Write about common functions