.PHONY: all lint check test coverage build clean run

all: lint check test coverage

lint:
	deno lint secret_scanner.ts secret_scanner_test.ts

check:
	deno check secret_scanner.ts secret_scanner_test.ts

test:
	deno test --allow-read --allow-write

coverage:
	deno test --allow-read --allow-write --coverage=cov_profile
	deno coverage cov_profile
	@echo "For HTML report: deno coverage cov_profile --html"

build:
	deno compile --allow-read --output secret_scanner secret_scanner.ts

run:
	deno run --allow-read secret_scanner.ts .

clean:
	rm -rf cov_profile secret_scanner
	rm -f test_*.txt

help:
	@echo "Available targets:"
	@echo "  all      - Run lint, check, test, coverage"
	@echo "  lint     - Run deno lint"
	@echo "  check    - Run deno type check"
	@echo "  test     - Run tests"
	@echo "  coverage - Generate coverage report"
	@echo "  build    - Compile to executable"
	@echo "  run      - Run scanner on current directory"
	@echo "  clean    - Remove generated files"