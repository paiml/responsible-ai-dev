.PHONY: all lint check test coverage build clean run help

all: lint check test coverage

lint:
	deno lint flaw_detector.ts flaw_detector_test.ts

check:
	deno check flaw_detector.ts flaw_detector_test.ts

test:
	deno test --allow-read --allow-write --allow-run

coverage:
	deno test --allow-read --allow-write --allow-run --coverage=cov_profile
	deno coverage cov_profile
	@echo "For HTML report: deno coverage cov_profile --html"

build:
	deno compile --allow-read --output flaw_detector flaw_detector.ts

run:
	deno run --allow-read flaw_detector.ts .

clean:
	rm -rf cov_profile flaw_detector
	rm -f test_*.ts

help:
	@echo "Available targets:"
	@echo "  all      - Run lint, check, test, coverage"
	@echo "  lint     - Run deno lint"
	@echo "  check    - Run deno type check"
	@echo "  test     - Run tests"
	@echo "  coverage - Generate coverage report"
	@echo "  build    - Compile to executable"
	@echo "  run      - Run validator on current directory"
	@echo "  clean    - Remove generated files"