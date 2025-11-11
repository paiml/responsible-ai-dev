// secret_scanner.ts
export interface SecretMatch {
  type: "AWS" | "OpenAI";
  file: string;
  line: number;
  value: string;
}

const AWS_KEY_PATTERN = /AKIA[0-9A-Z]{16}/g;
const OPENAI_KEY_PATTERN = /sk-[a-zA-Z0-9]{40,}/g;

export async function scanFile(path: string): Promise<SecretMatch[]> {
  const content = await Deno.readTextFile(path);
  const matches: SecretMatch[] = [];
  
  content.split("\n").forEach((line, idx) => {
    for (const match of line.matchAll(AWS_KEY_PATTERN)) {
      matches.push({ type: "AWS", file: path, line: idx + 1, value: match[0] });
    }
    for (const match of line.matchAll(OPENAI_KEY_PATTERN)) {
      matches.push({ type: "OpenAI", file: path, line: idx + 1, value: match[0] });
    }
  });
  
  return matches;
}

export async function scanDirectory(dir: string): Promise<SecretMatch[]> {
  const results: SecretMatch[] = [];
  
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
  const secrets = await scanDirectory(dir);
  
  if (secrets.length > 0) {
    console.error(`⚠️  Found ${secrets.length} secrets:`);
    secrets.forEach(s => console.log(`  ${s.type} key in ${s.file}:${s.line}`));
    Deno.exit(1);
  } else {
    console.log("✅ No secrets found");
  }
}
