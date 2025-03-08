# 3. Security implementation policy
Date: 2023-09-08

## Status
Approved

## Context
Establish a policy to prevent the implementation of security-vulnerable code that tends to occur when building WEB applications.

## Agreed Items
["How to make an IPA secure website, revised 7th edition"](https://www.ipa.go.jp/files/000017316.pdf). Refer to the checklist to define the architecture that prevents implementation of vulnerable code.
For details of each countermeasure, refer to subdirectory of this document.

## Result
--

## Detail
@@toc { depth=1 }
@@@ index
- [SQL Injection](01-sql-injection_en.md)
- [OS Command Injection](02-os-command-injection_en.md)
- [Directory Traversal](03-directory-traversal_en.md)
- [Session](04-managing-session_en.md)
- [XSS](05-xss_en.md)
- [Header Injection](07-http-header-injection_en.md)
- [Mail Header](08-mail-header-injection_en.md)
- [Click Jacking](09-click-jacking_en.md)
- [Buffer Overflow](10-buffer-overflow_en.md)
- [Authorization](11-auth_en.md)
@@@
