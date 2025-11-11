# Security Scanner

A static analysis tool to detect common security vulnerabilities in TypeScript and JavaScript code.

## Detects

1. **SQL Injection** - String concatenation in SQL queries
2. **Hardcoded Credentials** - Passwords, API keys, secrets, and tokens in source code

## Quick Start

```bash
# Run all checks
make all

# Run scanner on current directory
make run

# Build standalone executable
make build
./security_scanner .
```

## Demo Usage

Perfect for 3-4 minute demos showing security vulnerability detection:

```bash
# Show it works on clean code
make test          # All tests pass

# Run on real code
make run          # Finds vulnerabilities in test files

# Show coverage
make coverage     # Generate coverage report
```

## Patterns

### SQL Injection Detection
- `.query()` and `.execute()` with string concatenation
- Direct concatenation in SELECT, INSERT, UPDATE, DELETE statements

### Credential Detection
- password, apiKey, secret, token assignments
- Configurable minimum lengths for each credential type
