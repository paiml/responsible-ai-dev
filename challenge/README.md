# Secret Scanner

A lightweight tool to detect leaked API keys and credentials in source code.

## Detects

1. **AWS Access Keys** - AKIA[0-9A-Z]{16} pattern
2. **OpenAI API Keys** - sk-[a-zA-Z0-9]{40+} pattern

## Quick Start

```bash
# Run all checks
make all

# Run scanner on current directory
make run

# Build standalone executable
make build
./secret_scanner .
```

## Demo Usage

Perfect for 3-4 minute demos showing secret detection:

```bash
# Show it works on clean code
make test          # All tests pass

# Run on real code
make run          # Finds secrets in test files

# Show coverage
make coverage     # Generate coverage report
```

## Key Patterns

Scans all `.ts` and `.js` files for:
- **AWS Keys**: Start with `AKIA` followed by 16 alphanumeric characters
- **OpenAI Keys**: Start with `sk-` followed by 40+ alphanumeric characters

Perfect for preventing accidental credential commits to version control.
