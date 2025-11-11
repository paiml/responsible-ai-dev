# Code Flaw Detector

A simple static analysis tool to detect common coding issues and AI-generated code flaws.

## Detects

1. **Import Not Allowed** - Imports not in your approved allowlist
2. **Unreachable Code** - Code after return/throw statements

## Quick Start

```bash
# Run all checks
make all

# Run scanner on current directory
make run

# Build standalone executable
make build
./flaw_detector .
```

## Demo Usage

Perfect for 3-4 minute demos showing AI code validation:

```bash
# Show it works on clean code
make test          # All tests pass

# Run on real code
make run          # Finds flaws in test files

# Show coverage
make coverage     
```

## Allowlist

Modify `ALLOWED_IMPORTS` in flaw_detector.ts to customize what imports are permitted.

Default allows:
- Deno standard library modules
- npm:lodash
- npm:chalk
- Relative imports (./...)
