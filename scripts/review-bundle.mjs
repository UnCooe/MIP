import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ORDER = ["fact", "observation", "pending_confirmation"];

function parseArgs(argv) {
  const options = {
    input: resolve(process.cwd(), ".mip-suggestions", "review-bundle.json"),
    format: "text",
    output: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      options.input = resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--format" && argv[index + 1]) {
      options.format = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--output" && argv[index + 1]) {
      options.output = resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
  }

  if (options.format !== "text" && options.format !== "markdown") {
    throw new Error(`Unsupported format: ${options.format}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node .\\scripts\\review-bundle.mjs [--input <bundle-path>] [--format <text|markdown>] [--output <path>]

Defaults:
  --input ${resolve(process.cwd(), ".mip-suggestions", "review-bundle.json")}
  --format text`);
}

function loadBundle(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function groupSuggestions(bundle) {
  const grouped = { fact: [], observation: [], pending_confirmation: [] };
  for (const item of bundle.suggestions ?? []) {
    if (!grouped[item.class]) {
      grouped[item.class] = [];
    }
    grouped[item.class].push(item);
  }
  return grouped;
}

function buildEntryLines(item) {
  const lines = [
    `- ${item.entry.key}: ${item.entry.value}`,
    `  file: ${item.file}`,
    `  source: ${item.entry.source}`,
  ];
  if (item.entry.evidence) {
    lines.push(`  evidence: ${item.entry.evidence}`);
  }
  if (item.entry.confidence !== undefined) {
    lines.push(`  confidence: ${item.entry.confidence}`);
  }
  if (item.entry.reason) {
    lines.push(`  reason: ${item.entry.reason}`);
  }
  if (item.entry.notes) {
    lines.push(`  notes: ${item.entry.notes}`);
  }
  return lines;
}

function renderText(bundle, grouped, inputPath) {
  const lines = [
    "# MIP Suggestion Review",
    "",
    `Bundle: ${inputPath}`,
    `Created: ${bundle.created_at}`,
    `Summary: facts=${bundle.summary?.fact ?? 0}, observations=${bundle.summary?.observation ?? 0}, pending_confirmation=${bundle.summary?.pending_confirmation ?? 0}`,
  ];

  for (const section of ORDER) {
    const items = grouped[section] ?? [];
    lines.push("");
    lines.push(`## ${section}`);
    if (items.length === 0) {
      lines.push("- none");
      continue;
    }
    for (const item of items) {
      lines.push(...buildEntryLines(item));
    }
  }

  return `${lines.join("\n")}\n`;
}

function renderMarkdown(bundle, grouped, inputPath) {
  const lines = [
    "# MIP Suggestion Review",
    "",
    `- Bundle: \`${inputPath}\``,
    `- Created: ${bundle.created_at}`,
    `- Summary: facts=${bundle.summary?.fact ?? 0}, observations=${bundle.summary?.observation ?? 0}, pending_confirmation=${bundle.summary?.pending_confirmation ?? 0}`,
  ];

  for (const section of ORDER) {
    const items = grouped[section] ?? [];
    lines.push("");
    lines.push(`## ${section}`);
    if (items.length === 0) {
      lines.push("- none");
      continue;
    }
    for (const item of items) {
      lines.push(`- **${item.entry.key}**: ${item.entry.value}`);
      lines.push(`  - file: \`${item.file}\``);
      lines.push(`  - source: \`${item.entry.source}\``);
      if (item.entry.evidence) {
        lines.push(`  - evidence: ${item.entry.evidence}`);
      }
      if (item.entry.confidence !== undefined) {
        lines.push(`  - confidence: ${item.entry.confidence}`);
      }
      if (item.entry.reason) {
        lines.push(`  - reason: ${item.entry.reason}`);
      }
      if (item.entry.notes) {
        lines.push(`  - notes: ${item.entry.notes}`);
      }
    }
  }

  return `${lines.join("\n")}\n`;
}

function renderReview(bundle, grouped, inputPath, format) {
  if (format === "markdown") {
    return renderMarkdown(bundle, grouped, inputPath);
  }
  return renderText(bundle, grouped, inputPath);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const bundle = loadBundle(options.input);
  const grouped = groupSuggestions(bundle);
  const output = renderReview(bundle, grouped, options.input, options.format);

  if (options.output) {
    writeFileSync(options.output, output, "utf8");
    console.log(`Wrote ${options.format} review to ${options.output}`);
    return;
  }

  process.stdout.write(output);
}

main();
