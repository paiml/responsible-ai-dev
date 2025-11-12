import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { scanFile, scanDirectory } from "./flaw_detector.ts";
import _axios from "npm:axios@1.6.0";

Deno.test("detects forbidden import", async () => {
  const results = await scanFile("./flaw_detector_test.ts");
  const forbidden = results.filter(r => r.type === "ForbiddenImport");
  assertEquals(forbidden.length >= 1, true);
});

Deno.test("detects unreachable code after return", async () => {
  const results = await scanFile("./flaw_detector_test.ts");
  const unreachable = results.filter(r => r.type === "UnreachableCode");
  assertEquals(unreachable.length >= 1, true);
});

Deno.test("allows whitelisted imports", async () => {
  await Deno.writeTextFile("test_allowed.ts", "import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';\n");
  const results = await scanFile("test_allowed.ts");
  assertEquals(results.length, 0);
  await Deno.remove("test_allowed.ts");
});

function _exampleFunction(): string {
  return "done";
}

Deno.test("detects unreachable code after throw", async () => {
  const content = `
function test() {
  throw new Error("fail");
  console.log("unreachable");
}`;
  await Deno.writeTextFile("test_throw.ts", content);
  const results = await scanFile("test_throw.ts");

  const unreachable = results.filter(r => r.type === "UnreachableCode");
  assertEquals(unreachable.length, 1);

  await Deno.remove("test_throw.ts");
});

Deno.test("detects unreachable code after break", async () => {
  const content = `
for (let i = 0; i < 10; i++) {
  break;
  console.log("unreachable");
}`;
  await Deno.writeTextFile("test_break.ts", content);
  const results = await scanFile("test_break.ts");

  const unreachable = results.filter(r => r.type === "UnreachableCode");
  assertEquals(unreachable.length, 1);

  await Deno.remove("test_break.ts");
});

Deno.test("allows return with closing brace on next line", async () => {
  const content = `
function test() {
  return "ok";
}`;
  await Deno.writeTextFile("test_return_brace.ts", content);
  const results = await scanFile("test_return_brace.ts");

  assertEquals(results.length, 0);

  await Deno.remove("test_return_brace.ts");
});

Deno.test("allows return with empty line after", async () => {
  const content = `
function test() {
  return "ok";

}`;
  await Deno.writeTextFile("test_return_empty.ts", content);
  const results = await scanFile("test_return_empty.ts");

  assertEquals(results.length, 0);

  await Deno.remove("test_return_empty.ts");
});

Deno.test("allows return with comment on next line", async () => {
  const content = `
function test() {
  return "ok";
  // this is a comment
}`;
  await Deno.writeTextFile("test_return_comment.ts", content);
  const results = await scanFile("test_return_comment.ts");

  assertEquals(results.length, 0);

  await Deno.remove("test_return_comment.ts");
});

Deno.test("detects multiple forbidden imports", async () => {
  const content = `
import axios from "npm:axios";
import lodash from "npm:lodash";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
`;
  await Deno.writeTextFile("test_imports.ts", content);
  const results = await scanFile("test_imports.ts");

  const forbidden = results.filter(r => r.type === "ForbiddenImport");
  assertEquals(forbidden.length, 2);

  await Deno.remove("test_imports.ts");
});

Deno.test("allows relative imports", async () => {
  const content = `
import { foo } from "./utils.ts";
import { bar } from "../lib/helpers.ts";
`;
  await Deno.writeTextFile("test_relative.ts", content);
  const results = await scanFile("test_relative.ts");

  assertEquals(results.length, 0);

  await Deno.remove("test_relative.ts");
});

Deno.test("allows esm.sh imports", async () => {
  const content = `
import React from "https://esm.sh/react@18";
`;
  await Deno.writeTextFile("test_esm.ts", content);
  const results = await scanFile("test_esm.ts");

  assertEquals(results.length, 0);

  await Deno.remove("test_esm.ts");
});

Deno.test("scanDirectory finds violations in .ts files", async () => {
  await Deno.mkdir("test_scan_dir", { recursive: true });
  await Deno.writeTextFile("test_scan_dir/file1.ts", 'import axios from "npm:axios";\n');
  await Deno.writeTextFile("test_scan_dir/file2.ts", "function test() { return 1;\nconsole.log('bad'); }\n");
  await Deno.writeTextFile("test_scan_dir/file3.ts", "const safe = 'hello';\n");

  const results = await scanDirectory("test_scan_dir");

  assertEquals(results.length, 2);
  assertStringIncludes(results[0].file, "test_scan_dir");

  await Deno.remove("test_scan_dir", { recursive: true });
});

Deno.test("scanDirectory finds violations in .js files", async () => {
  await Deno.mkdir("test_scan_js", { recursive: true });
  await Deno.writeTextFile("test_scan_js/script.js", 'import axios from "npm:axios";\n');
  await Deno.writeTextFile("test_scan_js/other.js", "const safe = 'hello';\n");

  const results = await scanDirectory("test_scan_js");

  assertEquals(results.length, 1);
  assertEquals(results[0].type, "ForbiddenImport");
  assertStringIncludes(results[0].file, "script.js");

  await Deno.remove("test_scan_js", { recursive: true });
});

Deno.test("scanDirectory ignores non-ts/js files", async () => {
  await Deno.mkdir("test_scan_mixed", { recursive: true });
  await Deno.writeTextFile("test_scan_mixed/code.ts", 'import axios from "npm:axios";\n');
  await Deno.writeTextFile("test_scan_mixed/readme.md", 'import axios from "npm:axios"\n');
  await Deno.writeTextFile("test_scan_mixed/data.txt", 'import axios from "npm:axios"\n');

  const results = await scanDirectory("test_scan_mixed");

  // Should only find the one in code.ts
  assertEquals(results.length, 1);
  assertStringIncludes(results[0].file, "code.ts");

  await Deno.remove("test_scan_mixed", { recursive: true });
});

Deno.test("scanDirectory returns empty for clean directory", async () => {
  await Deno.mkdir("test_scan_clean", { recursive: true });
  await Deno.writeTextFile("test_scan_clean/safe1.ts", "const safe = 'hello';\n");
  await Deno.writeTextFile("test_scan_clean/safe2.js", "const greeting = 'world';\n");

  const results = await scanDirectory("test_scan_clean");

  assertEquals(results.length, 0);

  await Deno.remove("test_scan_clean", { recursive: true });
});

Deno.test("CLI exits with 0 when no violations found", async () => {
  await Deno.mkdir("test_cli_clean", { recursive: true });
  await Deno.writeTextFile("test_cli_clean/safe.ts", "const safe = 'hello';\n");

  const process = new Deno.Command("deno", {
    args: ["run", "--allow-read", "flaw_detector.ts", "test_cli_clean"],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout } = await process.output();
  const output = new TextDecoder().decode(stdout);

  assertEquals(code, 0);
  assertStringIncludes(output, "No violations found");

  await Deno.remove("test_cli_clean", { recursive: true });
});

Deno.test("CLI exits with 1 when violations found", async () => {
  await Deno.mkdir("test_cli_violations", { recursive: true });
  await Deno.writeTextFile("test_cli_violations/bad.ts", 'import axios from "npm:axios";\n');

  const process = new Deno.Command("deno", {
    args: ["run", "--allow-read", "flaw_detector.ts", "test_cli_violations"],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stderr, stdout } = await process.output();
  const errorOutput = new TextDecoder().decode(stderr);
  const stdOutput = new TextDecoder().decode(stdout);
  const allOutput = errorOutput + stdOutput;

  assertEquals(code, 1);
  assertStringIncludes(allOutput, "Found");
  assertStringIncludes(allOutput, "violations");

  await Deno.remove("test_cli_violations", { recursive: true });
});