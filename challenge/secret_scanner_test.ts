// secret_scanner_test.ts
import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { scanFile, scanDirectory } from "./secret_scanner.ts";

Deno.test("detects AWS key", async () => {
  await Deno.writeTextFile("test_aws.txt", "const key = 'AKIAIOSFODNN7EXAMPLE';\n");
  const results = await scanFile("test_aws.txt");
  assertEquals(results.length, 1);
  assertEquals(results[0].type, "AWS");
  assertEquals(results[0].line, 1);
  assertEquals(results[0].value, "AKIAIOSFODNN7EXAMPLE");
  await Deno.remove("test_aws.txt");
});

Deno.test("detects OpenAI key", async () => {
  await Deno.writeTextFile("test_openai.txt", "sk-proj1234567890abcdefghijklmnopqrstuvwxyz12345612\n");
  const results = await scanFile("test_openai.txt");
  assertEquals(results.length, 1);
  assertEquals(results[0].type, "OpenAI");
  assertStringIncludes(results[0].value, "sk-proj");
  await Deno.remove("test_openai.txt");
});

Deno.test("returns empty for clean file", async () => {
  await Deno.writeTextFile("test_clean.txt", "const safe = 'hello';\n");
  const results = await scanFile("test_clean.txt");
  assertEquals(results.length, 0);
  await Deno.remove("test_clean.txt");
});

Deno.test("detects multiple secrets in one file", async () => {
  const content = `
const aws1 = 'AKIAIOSFODNN7EXAMPLE';
const aws2 = 'AKIAJKLMNOPQRSTUVWXY';
const openai = 'sk-proj1234567890abcdefghijklmnopqrstuvwxyz12345612';
`;
  await Deno.writeTextFile("test_multiple.ts", content);
  const results = await scanFile("test_multiple.ts");
  assertEquals(results.length, 3);
  assertEquals(results.filter(r => r.type === "AWS").length, 2);
  assertEquals(results.filter(r => r.type === "OpenAI").length, 1);
  await Deno.remove("test_multiple.ts");
});

Deno.test("tracks correct line numbers", async () => {
  const content = `line 1: safe
line 2: safe
line 3: AKIAIOSFODNN7EXAMPLE
line 4: safe
line 5: sk-proj1234567890abcdefghijklmnopqrstuvwxyz12345612`;
  await Deno.writeTextFile("test_lines.ts", content);
  const results = await scanFile("test_lines.ts");
  assertEquals(results.length, 2);
  assertEquals(results[0].line, 3);
  assertEquals(results[1].line, 5);
  await Deno.remove("test_lines.ts");
});

Deno.test("scanDirectory finds secrets in .ts files", async () => {
  await Deno.mkdir("test_scan_dir", { recursive: true });
  await Deno.writeTextFile("test_scan_dir/file1.ts", "const key = 'AKIAIOSFODNN7EXAMPLE';\n");
  await Deno.writeTextFile("test_scan_dir/file2.ts", "const safe = 'hello';\n");
  await Deno.writeTextFile("test_scan_dir/file3.ts", "const openai = 'sk-proj1234567890abcdefghijklmnopqrstuvwxyz12345612';\n");

  const results = await scanDirectory("test_scan_dir");

  assertEquals(results.length, 2);
  assertStringIncludes(results[0].file, "test_scan_dir");

  await Deno.remove("test_scan_dir", { recursive: true });
});

Deno.test("scanDirectory finds secrets in .js files", async () => {
  await Deno.mkdir("test_scan_js", { recursive: true });
  await Deno.writeTextFile("test_scan_js/script.js", "const key = 'AKIAIOSFODNN7EXAMPLE';\n");
  await Deno.writeTextFile("test_scan_js/other.js", "const safe = 'hello';\n");

  const results = await scanDirectory("test_scan_js");

  assertEquals(results.length, 1);
  assertEquals(results[0].type, "AWS");
  assertStringIncludes(results[0].file, "script.js");

  await Deno.remove("test_scan_js", { recursive: true });
});

Deno.test("scanDirectory ignores non-ts/js files", async () => {
  await Deno.mkdir("test_scan_mixed", { recursive: true });
  await Deno.writeTextFile("test_scan_mixed/code.ts", "const key = 'AKIAIOSFODNN7EXAMPLE';\n");
  await Deno.writeTextFile("test_scan_mixed/readme.md", "AKIAIOSFODNN7EXAMPLE\n");
  await Deno.writeTextFile("test_scan_mixed/data.txt", "AKIAIOSFODNN7EXAMPLE\n");

  const results = await scanDirectory("test_scan_mixed");

  // Should only find the one in code.ts, not in .md or .txt
  assertEquals(results.length, 1);
  assertStringIncludes(results[0].file, "code.ts");

  await Deno.remove("test_scan_mixed", { recursive: true });
});

Deno.test("scanDirectory returns empty for directory with no secrets", async () => {
  await Deno.mkdir("test_scan_clean", { recursive: true });
  await Deno.writeTextFile("test_scan_clean/safe1.ts", "const safe = 'hello';\n");
  await Deno.writeTextFile("test_scan_clean/safe2.js", "const greeting = 'world';\n");

  const results = await scanDirectory("test_scan_clean");

  assertEquals(results.length, 0);

  await Deno.remove("test_scan_clean", { recursive: true });
});

Deno.test("CLI exits with 0 when no secrets found", async () => {
  await Deno.mkdir("test_cli_clean", { recursive: true });
  await Deno.writeTextFile("test_cli_clean/safe.ts", "const safe = 'hello';\n");

  const process = new Deno.Command("deno", {
    args: ["run", "--allow-read", "secret_scanner.ts", "test_cli_clean"],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout } = await process.output();
  const output = new TextDecoder().decode(stdout);

  assertEquals(code, 0);
  assertStringIncludes(output, "No secrets found");

  await Deno.remove("test_cli_clean", { recursive: true });
});

Deno.test("CLI exits with 1 when secrets found", async () => {
  await Deno.mkdir("test_cli_secrets", { recursive: true });
  await Deno.writeTextFile("test_cli_secrets/bad.ts", "const key = 'AKIAIOSFODNN7EXAMPLE';\n");

  const process = new Deno.Command("deno", {
    args: ["run", "--allow-read", "secret_scanner.ts", "test_cli_secrets"],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stderr } = await process.output();
  const errorOutput = new TextDecoder().decode(stderr);

  assertEquals(code, 1);
  assertStringIncludes(errorOutput, "Found");
  assertStringIncludes(errorOutput, "secrets");

  await Deno.remove("test_cli_secrets", { recursive: true });
});