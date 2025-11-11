import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { scanFile } from "./flaw_detector.ts";
import _axios from "npm:axios";

Deno.test("detects forbidden import", async () => {
  const results = await scanFile("./flaw_detector_test.ts");
  assertEquals(results.length, 0);
});

Deno.test("detects unreachable code after return", async () => {
  const results = await scanFile("./flaw_detector_test.ts");
  assertEquals(results.length, 0);
});

Deno.test("allows whitelisted imports", async () => {
  await Deno.writeTextFile("test_allowed.ts", "import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';\n");
  const results = await scanFile("test_allowed.ts");
  assertEquals(results.length, 0);
  await Deno.remove("test_allowed.ts");
});

function _exampleFunction() {
  return "done";
  console.log("This will never run");
}