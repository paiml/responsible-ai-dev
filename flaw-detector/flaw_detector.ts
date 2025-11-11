export interface Violation {
  type: "ForbiddenImport" | "UnreachableCode";
  file: string;
  line: number;
  value: string;
}

// Whitelist of allowed import sources
const ALLOWED_IMPORTS = [
  "https://deno.land/std@",
  "https://esm.sh/",
  "./",
  "../"
];

const IMPORT_PATTERN = /^import\s+.*\s+from\s+["']([^"']+)["']/;
const UNREACHABLE_PATTERNS = [
  /return\s+.+;?\s*$/,
  /throw\s+.+;?\s*$/,
  /break;?\s*$/
];

export async function scanFile(path: string): Promise<Violation[]> {
  const content = await Deno.readTextFile(path);
  const violations: Violation[] = [];
  const lines = content.split("\n");
  
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx].trim();
    
    // Check for forbidden imports
    const importMatch = line.match(IMPORT_PATTERN);
    if (importMatch) {
      const importPath = importMatch[1];
      const isAllowed = ALLOWED_IMPORTS.some(allowed => importPath.startsWith(allowed));
      
      if (!isAllowed) {
        violations.push({
          type: "ForbiddenImport",
          file: path,
          line: idx + 1,
          value: importPath
        });
      }
    }
    
    // Check for unreachable code
    const hasTerminator = UNREACHABLE_PATTERNS.some(pattern => pattern.test(line));
    if (hasTerminator && idx + 1 < lines.length) {
      const nextLine = lines[idx + 1].trim();
      // Check if next line has code (not empty, not comment, not closing brace)
      if (nextLine && !nextLine.startsWith("//") && !nextLine.startsWith("}")) {
        violations.push({
          type: "UnreachableCode",
          file: path,
          line: idx + 2,
          value: nextLine
        });
      }
    }
  }
  
  return violations;
}

export async function scanDirectory(dir: string): Promise<Violation[]> {
  const results: Violation[] = [];
  
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
  const violations = await scanDirectory(dir);
  
  if (violations.length > 0) {
    console.error(`⚠️  Found ${violations.length} violations:`);
    violations.forEach(v => {
      if (v.type === "ForbiddenImport") {
        console.log(`  Forbidden import "${v.value}" in ${v.file}:${v.line}`);
      } else {
        console.log(`  Unreachable code in ${v.file}:${v.line}`);
      }
    });
    Deno.exit(1);
  } else {
    console.log("✅ No violations found");
  }
}