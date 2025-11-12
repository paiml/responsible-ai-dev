.PHONY: help install test test-fast lint check coverage clean build run-all validate repo-score
.PHONY: challenge flaw-detector security validation
.PHONY: challenge-% flaw-detector-% security-% validation-%

# Disable built-in implicit rules for performance
.SUFFIXES:

# Delete partially-built files on error
.DELETE_ON_ERROR:

# Project directories
PROJECTS := challenge flaw-detector security validation
PROJECT_DIRS := $(addprefix ./,$(PROJECTS))

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

help:  ## Show this help message
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@echo "$(BLUE)📋  Responsible AI Development - Makefile Help$(RESET)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@echo ""
	@echo "$(GREEN)Main Targets:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		grep -v '^[a-zA-Z_-]*-[a-zA-Z_-]*:' | \
		sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)Project-Specific Targets:$(RESET)"
	@echo "  $(BLUE)challenge-<target>$(RESET)      Run target in challenge/"
	@echo "  $(BLUE)flaw-detector-<target>$(RESET)  Run target in flaw-detector/"
	@echo "  $(BLUE)security-<target>$(RESET)       Run target in security/"
	@echo "  $(BLUE)validation-<target>$(RESET)     Run target in validation/"
	@echo ""
	@echo "$(YELLOW)Examples:$(RESET)"
	@echo "  make challenge-test      # Run tests in challenge/"
	@echo "  make security-lint       # Run linting in security/"
	@echo "  make test                # Run tests in all projects"
	@echo ""

install:  ## Install dependencies (deno is required)
	@echo "$(BLUE)⚙️  Checking dependencies...$(RESET)"
	@command -v deno >/dev/null 2>&1 || { \
		echo "$(RED)❌ Error: deno is not installed$(RESET)"; \
		echo "$(YELLOW)Install from: https://deno.com/$(RESET)"; \
		exit 1; \
	}
	@echo "$(GREEN)✅ deno $(shell deno --version | head -1) installed$(RESET)"
	@command -v bashrs >/dev/null 2>&1 && echo "$(GREEN)✅ bashrs installed$(RESET)" || \
		echo "$(YELLOW)⚠️  bashrs not found (optional for linting Makefiles)$(RESET)"

test-fast:  ## Run fast tests in all projects (<5 min target)
	@echo "$(BLUE)⚡ Running fast tests in all projects...$(RESET)"
	@for dir in $(PROJECTS); do \
		echo "$(BLUE)━━━ Testing: $$dir ━━━$(RESET)"; \
		$(MAKE) -C "$$dir" test || exit 1; \
	done
	@echo "$(GREEN)✅ All fast tests passed$(RESET)"

test:  ## Run all tests in all projects
	@echo "$(BLUE)🧪 Running all tests...$(RESET)"
	@for dir in $(PROJECTS); do \
		echo "$(BLUE)━━━ Testing: $$dir ━━━$(RESET)"; \
		$(MAKE) -C "$$dir" test || exit 1; \
	done
	@echo "$(GREEN)✅ All tests passed$(RESET)"

lint:  ## Run linting in all projects
	@echo "$(BLUE)🔍 Running linters...$(RESET)"
	@echo "$(BLUE)━━━ Linting Makefile ━━━$(RESET)"
	@command -v bashrs >/dev/null 2>&1 && bashrs lint Makefile || \
		echo "$(YELLOW)⚠️  bashrs not installed, skipping Makefile lint$(RESET)"
	@for dir in $(PROJECTS); do \
		echo "$(BLUE)━━━ Linting: $$dir ━━━$(RESET)"; \
		$(MAKE) -C "$$dir" lint || exit 1; \
	done
	@echo "$(GREEN)✅ All linting passed$(RESET)"

check:  ## Run type checking in all projects
	@echo "$(BLUE)🔎 Running type checks...$(RESET)"
	@for dir in $(PROJECTS); do \
		echo "$(BLUE)━━━ Type checking: $$dir ━━━$(RESET)"; \
		$(MAKE) -C "$$dir" check || exit 1; \
	done
	@echo "$(GREEN)✅ All type checks passed$(RESET)"

coverage:  ## Generate coverage reports for all projects (<10 min target)
	@echo "$(BLUE)📊 Generating coverage reports...$(RESET)"
	@for dir in $(PROJECTS); do \
		echo "$(BLUE)━━━ Coverage: $$dir ━━━$(RESET)"; \
		$(MAKE) -C "$$dir" coverage || exit 1; \
	done
	@echo "$(GREEN)✅ Coverage reports generated$(RESET)"
	@echo "$(YELLOW)View HTML reports: deno coverage <project>/cov_profile --html$(RESET)"

build:  ## Build all projects
	@echo "$(BLUE)🔨 Building all projects...$(RESET)"
	@for dir in $(PROJECTS); do \
		echo "$(BLUE)━━━ Building: $$dir ━━━$(RESET)"; \
		$(MAKE) -C "$$dir" build || exit 1; \
	done
	@echo "$(GREEN)✅ All projects built$(RESET)"

clean:  ## Clean all build artifacts and coverage data
	@echo "$(BLUE)🧹 Cleaning all projects...$(RESET)"
	@for dir in $(PROJECTS); do \
		echo "$(BLUE)━━━ Cleaning: $$dir ━━━$(RESET)"; \
		$(MAKE) -C "$$dir" clean || exit 1; \
	done
	@echo "$(GREEN)✅ All projects cleaned$(RESET)"

run-all:  ## Run all scanners/validators
	@echo "$(BLUE)🚀 Running all tools...$(RESET)"
	@for dir in $(PROJECTS); do \
		echo "$(BLUE)━━━ Running: $$dir ━━━$(RESET)"; \
		$(MAKE) -C "$$dir" run || exit 1; \
	done
	@echo "$(GREEN)✅ All tools executed$(RESET)"

validate:  ## Run all quality gates (lint + check + test + coverage)
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@echo "$(BLUE)🔒  Running Quality Validation$(RESET)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	$(MAKE) lint
	$(MAKE) check
	$(MAKE) test
	$(MAKE) coverage
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"
	@echo "$(GREEN)✅  All quality gates passed!$(RESET)"
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(RESET)"

repo-score:  ## Calculate repository health score
	@echo "$(BLUE)📊 Calculating repository score...$(RESET)"
	@command -v pmat >/dev/null 2>&1 || { \
		echo "$(YELLOW)⚠️  pmat not installed, using toolkit binary$(RESET)"; \
		../paiml-mcp-agent-toolkit/target/release/pmat repo-score --path . --verbose; \
		exit 0; \
	}
	@pmat repo-score --path . --verbose

# Project-specific targets (e.g., challenge-test, security-lint)
challenge-%:
	@$(MAKE) -C challenge $*

flaw-detector-%:
	@$(MAKE) -C flaw-detector $*

security-%:
	@$(MAKE) -C security $*

validation-%:
	@$(MAKE) -C validation $*

.DEFAULT_GOAL := help
