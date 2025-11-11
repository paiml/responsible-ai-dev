.PHONY: all lint check test coverage build clean run help

all: lint check test coverage

lint:
	deno lint validating_code.ts

check:
	deno check validating_code.ts

run:
	deno run --allow-read validating_code.ts .

clean:
	rm -rf cov_profile flaw_detector
	rm -f test_*.ts

help:
	@echo "Available targets:"
	@echo "  all      - Run lint, check, test, coverage"
	@echo "  lint     - Run deno lint"
	@echo "  check    - Run deno type check"
	@echo "  run      - Run validator on current directory"
	@echo "  clean    - Remove generated files"