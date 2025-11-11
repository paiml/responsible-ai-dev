# Validation Code Examples

Sample code demonstrating common TypeScript validation and type checking scenarios.

## Contains

1. **Type Mismatches** - Functions expecting numbers receiving strings
2. **Unused Variables** - Variable declarations that are never used
3. **Missing Type Annotations** - Functions without proper parameter types

## Quick Start

```bash
# Run linting and type checking
make all

# Check types
make check

# Run linter
make lint
```

## Demo Usage

Perfect for demonstrating TypeScript validation:

```bash
# Show type checking
make check        # Reveals type errors

# Run linter
make lint         # Shows code quality issues
```

## Example Issues

The `validating_code.ts` file contains intentional issues for demonstration:
- `addNumbers()` receives strings instead of numbers
- `unused` variable is declared but never used
- Missing type annotations on function parameters
- Type mismatches in function calls

Useful for testing static analysis tools and demonstrating the importance of proper TypeScript usage.
