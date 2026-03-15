import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

function parseArgs(argv) {
  const options = {
    input: resolve(homedir(), ".mip", "memory.json"),
    output: resolve(process.cwd(), "MIP-CONTEXT.md"),
    title: "User MIP Context",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      options.input = resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--output" && argv[index + 1]) {
      options.output = resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--title" && argv[index + 1]) {
      options.title = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node .\\scripts\\build-context.mjs [--input <path>] [--output <path>] [--title <text>]

Defaults:
  --input  ${resolve(homedir(), ".mip", "memory.json")}
  --output ${resolve(process.cwd(), "MIP-CONTEXT.md")}`);
}

export function loadMemory(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`Memory file not found: ${filePath}`);
  }

  const raw = readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function normalizeValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function renderSection(title, data) {
  const lines = [`## ${title}`];
  const entries = Object.entries(data ?? {}).filter(([, value]) => value !== "" && value !== undefined && value !== null);

  if (entries.length === 0) {
    lines.push("- None");
    return lines.join("\n");
  }

  for (const [key, value] of entries) {
    lines.push(`- ${key}: ${normalizeValue(value)}`);
  }

  return lines.join("\n");
}

export function buildContext(memory, options) {
  const sections = [
    `# ${options.title}`,
    "",
    "This file is generated from the user's MIP source of truth.",
    "If local history or inferred memory conflicts with this file, prefer this file for stable preferences and explicit self-corrections.",
    "Use confirmation before changing high-risk identity claims or long-term preferences.",
    "",
    renderSection("Identity", memory.identity),
    "",
    renderSection("Preferences", memory.preferences),
    "",
    renderSection("Custom", memory.custom),
  ];

  if (memory.facts) {
    sections.push("", renderSection("Facts", memory.facts));
  }

  if (memory.observations) {
    sections.push("", renderSection("Observations", memory.observations));
  }

  if (memory.pending_confirmation) {
    sections.push("", renderSection("Pending Confirmation", memory.pending_confirmation));
  }

  return `${sections.join("\n")}\n`;
}

export function writeContext(outputPath, content) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, content, "utf8");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const memory = loadMemory(options.input);
  const content = buildContext(memory, options);

  writeContext(options.output, content);

  console.log(`Generated ${options.output} from ${options.input}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}