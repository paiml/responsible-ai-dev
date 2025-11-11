export interface Vulnerability {
  type: "SQLInjection" | "HardcodedPassword";
  file: string;
  line: number;
  value: string;
}

// Patterns for SQL injection vulnerabilities
const SQL_INJECTION_PATTERNS = [
  /\.query\([^)]*\+[^)]*\)/g,  // db.query("SELECT * FROM users WHERE id=" + 1  OR 1=1)
  /\.execute\([^)]*\+[^)]*\)/g, // db.execute("DELETE FROM " + table)
  /SELECT.*\+.*FROM/gi,         // Direct string concat in SQL
  /INSERT.*\+.*VALUES/gi,
  /UPDATE.*\+.*SET/gi,
  /DELETE.*\+.*WHERE/gi
];

// Patterns for hardcoded passwords/credentials
const PASSWORD_PATTERNS = [
  /password\s*=\s*["'][^"']{3,}["']/gi,
  /PASSWORD\s*=\s*["'][^"']{3,}["']/g,
  /apiKey\s*=\s*["'][^"']{10,}["']/gi,
  /api_key\s*=\s*["'][^"']{10,}["']/gi,
  /secret\s*=\s*["'][^"']{6,}["']/gi,
  /token\s*=\s*["'][^"']{10,}["']/gi
];

export async function scanFile(path: string): Promise<Vulnerability[]> {
  const content = await Deno.readTextFile(path);
  const vulnerabilities: Vulnerability[] = [];
  const lines = content.split("\n");
  
  lines.forEach((line, idx) => {
    const trimmedLine = line.trim();
    
    // Skip comment lines
    if (trimmedLine.startsWith("//") || trimmedLine.startsWith("/*") || trimmedLine.startsWith("*")) {
      return;
    }
    
    // Skip regex pattern definitions
    if (trimmedLine.startsWith("/") && trimmedLine.includes("/g")) {
      return;
    }

    // Check for SQL injection
    for (const pattern of SQL_INJECTION_PATTERNS) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        vulnerabilities.push({
          type: "SQLInjection",
          file: path,
          line: idx + 1,
          value: match[0].substring(0, 50) // Truncate
        });
      }
    }
    
    // Check for hardcoded passwords
    for (const pattern of PASSWORD_PATTERNS) {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        vulnerabilities.push({
          type: "HardcodedPassword",
          file: path,
          line: idx + 1,
          value: match[0]
        });
      }
    }
  });
  
  return vulnerabilities;
}

export async function scanDirectory(dir: string): Promise<Vulnerability[]> {
  const results: Vulnerability[] = [];
  
  for await (const entry of Deno.readDir(dir)) {
    if (entry.isFile && (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))) {
      results.push(...await scanFile(`${dir}/${entry.name}`));
    }
  }
  
  return results;
}

// CLI usage
if (import.meta.main) {
  const dir = Deno.args[0] || ".";
  const vulnerabilities = await scanDirectory(dir);
  
  if (vulnerabilities.length > 0) {
    console.error(`⚠️  Found ${vulnerabilities.length} security vulnerabilities:`);
    vulnerabilities.forEach(v => {
      if (v.type === "SQLInjection") {
        console.log(`  SQL Injection risk in ${v.file}:${v.line}`);
        console.log(`     ${v.value}`);
      } else {
        console.log(`  Hardcoded credential in ${v.file}:${v.line}`);
        console.log(`     ${v.value}`);
      }
    });
    Deno.exit(1);
  } else {
    console.log("✅ No security vulnerabilities found");
  }
}