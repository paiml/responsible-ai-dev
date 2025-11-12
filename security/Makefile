.PHONY: all lint check test coverage build clean run help

all: lint check test coverage

lint:
	deno lint security_scanner.ts security_scanner_test.ts

check:
	deno check security_scanner.ts security_scanner_test.ts

test:
	deno test --allow-read --allow-write --allow-run

coverage:
	deno test --allow-read --allow-write --allow-run --coverage=cov_profile
	deno coverage cov_profile
	@echo "For HTML report: deno coverage cov_profile --html"

build:
	deno compile --allow-read --output security_scanner security_scanner.ts

run:
	deno run --allow-read security_scanner.ts .

clean:
	rm -rf cov_profile security_scanner
	rm -f test_*.ts

help:
	@echo "Available targets:"
	@echo "  all      - Run lint, check, test, coverage"
	@echo "  lint     - Run deno lint"
	@echo "  check    - Run deno type check"
	@echo "  test     - Run tests"
	@echo "  coverage - Generate coverage report"
	@echo "  build    - Compile to executable"
	@echo "  run      - Run security scanner on current directory"
	@echo "  clean    - Remove generated files"
