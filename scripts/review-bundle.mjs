import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ORDER = ["fact", "observation", "pending_confirmation"];

function parseArgs(argv) {
  const options = {
    input: resolve(process.cwd(), ".mip-suggestions", "review-bundle.json"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      options.input = resolve(argv[index + 1]);
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
  node .\\scripts\\review-bundle.mjs [--input <bundle-path>]

Defaults:
  --input ${resolve(process.cwd(), ".mip-suggestions", "review-bundle.json")}`);
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

function printEntry(item) {
  console.log(`- ${item.entry.key}: ${item.entry.value}`);
  console.log(`  file: ${item.file}`);
  console.log(`  source: ${item.entry.source}`);
  if (item.entry.evidence) {
    console.log(`  evidence: ${item.entry.evidence}`);
  }
  if (item.entry.confidence !== undefined) {
    console.log(`  confidence: ${item.entry.confidence}`);
  }
  if (item.entry.reason) {
    console.log(`  reason: ${item.entry.reason}`);
  }
  if (item.entry.notes) {
    console.log(`  notes: ${item.entry.notes}`);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const bundle = loadBundle(options.input);
  const grouped = groupSuggestions(bundle);

  console.log(`# MIP Suggestion Review`);
  console.log(``);
  console.log(`Bundle: ${options.input}`);
  console.log(`Created: ${bundle.created_at}`);
  console.log(`Summary: facts=${bundle.summary?.fact ?? 0}, observations=${bundle.summary?.observation ?? 0}, pending_confirmation=${bundle.summary?.pending_confirmation ?? 0}`);

  for (const section of ORDER) {
    const items = grouped[section] ?? [];
    console.log(``);
    console.log(`## ${section}`);
    if (items.length === 0) {
      console.log(`- none`);
      continue;
    }
    for (const item of items) {
      printEntry(item);
    }
  }
}

main();