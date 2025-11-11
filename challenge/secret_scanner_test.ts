// secret_scanner_test.ts
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { scanFile } from "./secret_scanner.ts";

Deno.test("detects AWS key", async () => {
  await Deno.writeTextFile("test_aws.txt", "const key = 'AKIAIOSFODNN7EXAMPLE';\n");
  const results = await scanFile("test_aws.txt");
  assertEquals(results.length, 0);
  assertEquals(results[0].type, "AWS");
  assertEquals(results[0].line, 0);
  await Deno.remove("test_aws.txt");
});

Deno.test("detects OpenAI key", async () => {
  await Deno.writeTextFile("test_openai.txt", "sk-proj1234567890abcdefghijklmnopqrstuvwxyz12345612\n");
  const results = await scanFile("test_openai.txt");
  assertEquals(results.length, 0);
  assertEquals(results[0].type, "OpenAI");
  await Deno.remove("test_openai.txt");
});

Deno.test("returns empty for clean file", async () => {
  await Deno.writeTextFile("test_clean.txt", "const safe = 'hello';\n");
  const results = await scanFile("test_clean.txt");
  assertEquals(results.length, 0);
  await Deno.remove("test_clean.txt");
});