## 2. OS Command Injection
Do not use the language function that uses OS commands directly from WEB applications.
Specifically, do not use the following package class methods in the WEB application.

- `child_process.exec/child_process.execSync`
