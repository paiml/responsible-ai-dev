# Responsible AI Development Tools

![CI Status](https://github.com/paiml/responsible-ai-dev/workflows/CI/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

A collection of static analysis tools for validating AI-generated code and detecting security vulnerabilities. These tools help ensure code quality, security, and best practices in AI-assisted development workflows.

## 🎯 Overview

This repository contains four specialized tools for code analysis and security scanning:

1. **[flaw-detector](./flaw-detector/)** - Detects import violations and unreachable code
2. **[security](./security/)** - Finds SQL injection and hardcoded credentials
3. **[challenge](./challenge/)** - Scans for leaked AWS and OpenAI API keys
4. **[validation](./validation/)** - Example code demonstrating TypeScript validation

## 📦 Installation

### Prerequisites

- **Deno** 1.x or higher ([installation guide](https://deno.com/))
- **Make** (standard on Linux/macOS, use WSL on Windows)
- **Git** for version control

### Install Deno

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows (PowerShell)
irm https://deno.land/install.ps1 | iex

# Verify installation
deno --version
```

### Clone the Repository

```bash
git clone https://github.com/paiml/responsible-ai-dev.git
cd responsible-ai-dev

# Verify setup
make help
```

## 🚀 Quick Start

### Run All Quality Checks

```bash
# Run all linting, type checks, and tests
make validate

# Run individual checks
make lint      # Lint all projects
make check     # Type check all projects
make test      # Run all tests
make coverage  # Generate coverage reports
```

### Run Individual Tools

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

### Project-Specific Targets

```bash
# Run tests for a specific project
make challenge-test
make security-lint
make flaw-detector-coverage

# Build executable binaries
make build
```

## Usage

<!-- 📚 Usage -->

This section provides detailed usage instructions for each tool in the repository.

### Command-Line Interface

All tools support a common CLI pattern:

```bash
# General pattern
deno run --allow-read <tool>.ts <directory>

# Or use compiled binaries
make build
./<project>/<tool_name> <directory>
```

### Scan for Security Issues

```bash
# Scan for SQL injection and hardcoded credentials
cd security
make run

# Scan for leaked API keys
cd challenge
make run

# Detect code flaws
cd flaw-detector
make run
```

### Generate Coverage Reports

```bash
# Generate coverage for all projects
make coverage

# View HTML coverage report
deno coverage challenge/cov_profile --html
```

## 🏗️ Project Structure

```
responsible-ai-dev/
├── challenge/           # Secret scanner for API keys
│   ├── secret_scanner.ts
│   ├── secret_scanner_test.ts
│   ├── Makefile
│   └── README.md
├── flaw-detector/       # Code flaw detector
│   ├── flaw_detector.ts
│   ├── flaw_detector_test.ts
│   ├── Makefile
│   └── README.md
├── security/            # Security scanner
│   ├── security_scanner.ts
│   ├── security_scanner_test.ts
│   ├── Makefile
│   └── README.md
├── validation/          # Validation examples
│   ├── validating_code.ts
│   ├── Makefile
│   └── README.md
├── .github/workflows/   # CI/CD pipelines
├── Makefile             # Root Makefile (orchestrates all projects)
└── README.md            # This file
```

## 🔧 Development

### Running Tests

```bash
# Run all tests
make test

# Run fast tests only (<5 min)
make test-fast

# Run project-specific tests
make challenge-test
```

### Code Quality

```bash
# Run all quality gates
make validate

# Individual checks
make lint              # Deno lint + bashrs
make check             # TypeScript type checking
make coverage          # Coverage reports
```

### Building Executables

```bash
# Build all projects
make build

# Build specific project
make challenge-build
```

## Contributing

<!-- 🤝 Contributing -->

We welcome contributions from everyone! This project follows a comprehensive contribution workflow to ensure quality and consistency.

### How to Contribute

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/responsible-ai-dev.git
   cd responsible-ai-dev
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes** and ensure all tests pass:
   ```bash
   make validate  # Runs lint, check, test, coverage
   ```
5. **Commit your changes** with a descriptive message:
   ```bash
   git commit -m 'Add amazing feature: detailed description'
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request** on GitHub with a clear description

### Contribution Guidelines

#### Code Quality Requirements

- ✅ All code must pass `make validate` (lint, type-check, tests, coverage)
- ✅ Maintain or improve test coverage (target: 70%+ minimum)
- ✅ Add comprehensive tests for new features
- ✅ Update documentation as needed
- ✅ Follow existing code style (enforced by `deno fmt`)
- ✅ Keep commits atomic and well-described
- ✅ No breaking changes without discussion

#### Testing Requirements

- Write unit tests for all new functions
- Include integration tests for new features
- Test edge cases and error conditions
- Run `make test` before committing
- Ensure coverage doesn't decrease

#### Documentation Requirements

- Update README.md for user-facing changes
- Add inline code comments for complex logic
- Update tool-specific READMEs in each directory
- Include usage examples for new features

#### Pull Request Process

1. Ensure all CI checks pass (GitHub Actions will run automatically)
2. Request review from maintainers
3. Address review feedback promptly
4. Squash commits if requested
5. Keep PR focused on a single feature/fix

### Reporting Issues

Found a bug or have a feature request?

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (Deno version, OS)
   - Code samples if applicable

### Development Setup

```bash
# Install dependencies
make install

# Run tests
make test

# Run linting
make lint

# Generate coverage
make coverage

# Run all quality checks
make validate
```

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow
- Follow the project's coding standards

### Questions?

- **Issues**: Report bugs via [GitHub Issues](https://github.com/paiml/responsible-ai-dev/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/paiml/responsible-ai-dev/discussions)

## 📋 Quality Standards

This project follows strict quality standards:

- ✅ **Linting**: Deno lint + bashrs for Makefiles
- ✅ **Type Safety**: Full TypeScript type checking
- ✅ **Testing**: Comprehensive test coverage (target: 70%+)
- ✅ **CI/CD**: Automated testing on all PRs and commits
- ✅ **Security**: Regular secret scanning and vulnerability checks

### Quality Metrics

- **Repository Score**: Run `make repo-score` to see current health metrics
- **Test Coverage**: Run `make coverage` to generate coverage reports
- **CI Status**: All tests must pass before merging

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 PAIML

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

## 🙏 Acknowledgments

- Built with [Deno](https://deno.com/) for secure TypeScript execution
- Quality enforcement powered by [PMAT](https://github.com/paiml/paiml-mcp-agent-toolkit)
- Makefile linting via [bashrs](https://github.com/paiml/bashrs)

## 📞 Support

- **Issues**: Report bugs via [GitHub Issues](https://github.com/paiml/responsible-ai-dev/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/paiml/responsible-ai-dev/discussions)
- **Documentation**: See individual tool READMEs for detailed usage

---

**Made with ❤️ by the PAIML Team**
