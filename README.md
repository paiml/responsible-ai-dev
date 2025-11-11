# Responsible AI Development Tools

A collection of static analysis tools for validating AI-generated code and detecting security vulnerabilities.

## Tools

1. **[flaw-detector](./flaw-detector/)** - Detects import violations and unreachable code
2. **[security](./security/)** - Finds SQL injection and hardcoded credentials
3. **[challenge](./challenge/)** - Scans for leaked AWS and OpenAI API keys
4. **[validation](./validation/)** - Example code demonstrating TypeScript validation

## Quick Start

Each tool is self-contained with its own README and Makefile:

```bash
# Run any tool
cd flaw-detector
make all          # Run tests, linting, and coverage
make run          # Scan current directory

# Same pattern for all tools
cd security && make all
cd challenge && make all
```

## Use Cases

- **Pre-commit hooks** - Validate code before committing
- **CI/CD pipelines** - Automated security scanning
- **Code reviews** - Quick static analysis
- **Demos** - Each tool runs in 3-4 minutes with test coverage
