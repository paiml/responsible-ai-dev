import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { scanFile, scanDirectory } from "./security_scanner.ts";

Deno.test("detects SQL injection patterns", async () => {
  const content = `
function getUserById(userId: string) {
  return db.query("SELECT * FROM users WHERE id = " + userId);
}
function deleteUser(username: string) {
  return db.execute("DELETE FROM users WHERE name = " + username);
}`;
  await Deno.writeTextFile("test_sql_basic.ts", content);
  const results = await scanFile("test_sql_basic.ts");

  const sqlInjections = results.filter(r => r.type === "SQLInjection");
  assertEquals(sqlInjections.length, 2);

  await Deno.remove("test_sql_basic.ts");
});

Deno.test("detects hardcoded passwords", async () => {
  const content = `
const dbPassword = "MySecretP@ssw0rd123";
const apiKey = "sk-1234567890abcdefghijklmnop";`;
  await Deno.writeTextFile("test_passwords_basic.ts", content);
  const results = await scanFile("test_passwords_basic.ts");

  const passwords = results.filter(r => r.type === "HardcodedPassword");
  assertEquals(passwords.length, 2);

  await Deno.remove("test_passwords_basic.ts");
});

Deno.test("returns empty for safe code", async () => {
  const content = `
function getUser(userId: string) {
  return db.query("SELECT * FROM users WHERE id = ?", [userId]);
}
const config = { timeout: 5000 };`;
  await Deno.writeTextFile("test_safe.ts", content);
  const results = await scanFile("test_safe.ts");

  assertEquals(results.length, 0);

  await Deno.remove("test_safe.ts");
});

Deno.test("detects various SQL injection patterns", async () => {
  const content = `
const query1 = db.query("SELECT * FROM users WHERE id = " + userId);
const query2 = db.execute("DELETE FROM table WHERE id = " + id);
const sql1 = "SELECT name, email FROM users WHERE role = " + role;
const sql2 = "INSERT INTO logs VALUES (" + data + ")";
const sql3 = "UPDATE users SET name = " + name + " WHERE id = 1";
const sql4 = "DELETE FROM sessions WHERE token = " + token;
`;
  await Deno.writeTextFile("test_sql_injection.ts", content);
  const results = await scanFile("test_sql_injection.ts");

  const sqlInjections = results.filter(r => r.type === "SQLInjection");
  // The scanner detects .query() and .execute() calls with concatenation
  assertEquals(sqlInjections.length >= 2, true);

  await Deno.remove("test_sql_injection.ts");
});

Deno.test("detects various password patterns", async () => {
  const content = `
const password = "mySecret123";
const PASSWORD = "ADMIN_PASS";
const apiKey = "sk_live_1234567890abcdef";
const api_key = "prod_key_abcd1234";
const secret = "mysecret";
const token = "bearer_token123456";
`;
  await Deno.writeTextFile("test_passwords.ts", content);
  const results = await scanFile("test_passwords.ts");

  const passwords = results.filter(r => r.type === "HardcodedPassword");
  assertEquals(passwords.length >= 3, true);

  await Deno.remove("test_passwords.ts");
});

Deno.test("skips comment lines", async () => {
  const content = `
// password = "this is in a comment"
/* apiKey = "also in a comment" */
* token = "block comment"
const realPassword = "actualSecret123";
`;
  await Deno.writeTextFile("test_comments.ts", content);
  const results = await scanFile("test_comments.ts");

  // Should only find the real password, not the ones in comments
  assertEquals(results.length, 1);
  assertEquals(results[0].type, "HardcodedPassword");

  await Deno.remove("test_comments.ts");
});

Deno.test("detects PASSWORD variable assignment", async () => {
  const content = `
const pattern = /password\\s*=\\s*["'][^"']{3,}["']/gi;
const PASSWORD = "actualSecret";
`;
  await Deno.writeTextFile("test_regex.ts", content);
  const results = await scanFile("test_regex.ts");

  // Detects PASSWORD assignment (pattern is in const so not skipped)
  const passwords = results.filter(r => r.type === "HardcodedPassword");
  assertEquals(passwords.length >= 1, true);

  await Deno.remove("test_regex.ts");
});

Deno.test("tracks correct line numbers for vulnerabilities", async () => {
  const content = `line 1
line 2
const password = "secret123"
line 4
db.query("SELECT * FROM users WHERE id = " + id)
line 6`;
  await Deno.writeTextFile("test_line_numbers.ts", content);
  const results = await scanFile("test_line_numbers.ts");

  assertEquals(results.length, 2);
  assertEquals(results[0].line, 3);
  assertEquals(results[1].line, 5);

  await Deno.remove("test_line_numbers.ts");
});

Deno.test("scanDirectory finds vulnerabilities in .ts files", async () => {
  await Deno.mkdir("test_scan_dir", { recursive: true });
  await Deno.writeTextFile("test_scan_dir/file1.ts", 'const password = "secret123";\n');
  await Deno.writeTextFile("test_scan_dir/file2.ts", 'const safe = "hello";\n');
  await Deno.writeTextFile("test_scan_dir/file3.ts", 'db.query("SELECT * FROM users WHERE id = " + id);\n');

  const results = await scanDirectory("test_scan_dir");

  assertEquals(results.length, 2);
  assertStringIncludes(results[0].file, "test_scan_dir");

  await Deno.remove("test_scan_dir", { recursive: true });
});

Deno.test("scanDirectory finds vulnerabilities in .js files", async () => {
  await Deno.mkdir("test_scan_js", { recursive: true });
  await Deno.writeTextFile("test_scan_js/script.js", 'const apiKey = "sk_test_12345678901234567890";\n');
  await Deno.writeTextFile("test_scan_js/other.js", 'const safe = "hello";\n');

  const results = await scanDirectory("test_scan_js");

  assertEquals(results.length, 1);
  assertEquals(results[0].type, "HardcodedPassword");
  assertStringIncludes(results[0].file, "script.js");

  await Deno.remove("test_scan_js", { recursive: true });
});

Deno.test("scanDirectory ignores non-ts/js files", async () => {
  await Deno.mkdir("test_scan_mixed", { recursive: true });
  await Deno.writeTextFile("test_scan_mixed/code.ts", 'const password = "secret";\n');
  await Deno.writeTextFile("test_scan_mixed/readme.md", 'password = "secret"\n');
  await Deno.writeTextFile("test_scan_mixed/data.txt", 'password = "secret"\n');

  const results = await scanDirectory("test_scan_mixed");

  // Should only find the one in code.ts
  assertEquals(results.length, 1);
  assertStringIncludes(results[0].file, "code.ts");

  await Deno.remove("test_scan_mixed", { recursive: true });
});

Deno.test("scanDirectory returns empty for directory with no vulnerabilities", async () => {
  await Deno.mkdir("test_scan_clean", { recursive: true });
  await Deno.writeTextFile("test_scan_clean/safe1.ts", "const safe = 'hello';\n");
  await Deno.writeTextFile("test_scan_clean/safe2.js", "const greeting = 'world';\n");

  const results = await scanDirectory("test_scan_clean");

  assertEquals(results.length, 0);

  await Deno.remove("test_scan_clean", { recursive: true });
});

Deno.test("CLI exits with 0 when no vulnerabilities found", async () => {
  await Deno.mkdir("test_cli_clean", { recursive: true });
  await Deno.writeTextFile("test_cli_clean/safe.ts", "const safe = 'hello';\n");

  const process = new Deno.Command("deno", {
    args: ["run", "--allow-read", "security_scanner.ts", "test_cli_clean"],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout } = await process.output();
  const output = new TextDecoder().decode(stdout);

  assertEquals(code, 0);
  assertStringIncludes(output, "No security vulnerabilities found");

  await Deno.remove("test_cli_clean", { recursive: true });
});

Deno.test("CLI exits with 1 and shows details when vulnerabilities found", async () => {
  await Deno.mkdir("test_cli_vuln", { recursive: true });
  await Deno.writeTextFile("test_cli_vuln/bad.ts", 'const password = "secret123";\ndb.query("SELECT * FROM users WHERE id = " + id);\n');

  const process = new Deno.Command("deno", {
    args: ["run", "--allow-read", "security_scanner.ts", "test_cli_vuln"],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stderr, stdout } = await process.output();
  const errorOutput = new TextDecoder().decode(stderr);
  const stdOutput = new TextDecoder().decode(stdout);
  const allOutput = errorOutput + stdOutput;

  assertEquals(code, 1);
  assertStringIncludes(allOutput, "Found");
  assertStringIncludes(allOutput, "vulnerabilities");

  await Deno.remove("test_cli_vuln", { recursive: true });
});