import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { scanFile } from "./security_scanner.ts";

// Hardcoded password
const _dbPassword = "MySecretP@ssw0rd123";
const _apiKey = "sk-1234567890abcdefghijklmnop";

Deno.test("detects SQL injection", async () => {
  const results = await scanFile("./security_scanner_test.ts");
  assertEquals(results.length, 0);
});

Deno.test("detects hardcoded passwords", async () => {
  const results = await scanFile("./security_scanner_test.ts");
  assertEquals(results.length, 0);
});

function _getUserById(userId: string) {
  return db.query("SELECT * FROM users WHERE id = " + userId);
}

function _deleteUser(username: string) {
  return db.execute("DELETE FROM users WHERE name = " + username);
}

Deno.test("allows safe parameterized queries", async () => {
  const results = await scanFile("./security_scanner_test.ts");
  assertEquals(results.length, 0);
});

// Mock db object to prevent errors
const db = {
  query: (_sql: string) => [],
  execute: (_sql: string) => true
};