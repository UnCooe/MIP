import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getMipPath } from "./mip-paths.mjs";

function parseArgs(argv) {
  const options = {
    inputDir: getMipPath("suggestions"),
    output: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input-dir" && argv[index + 1]) {
      options.inputDir = resolve(argv[index + 1]);
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

  return options;
}

function printHelp() {
  console.log(`Usage:
  node .\\scripts\\pack-suggestions.mjs [--input-dir <path>] [--output <path>]

Defaults:
  --input-dir ${getMipPath("suggestions")}
  --output    ${getMipPath("suggestions", "review-bundle.json")}`);
}

function readSuggestions(inputDir) {
  const files = readdirSync(inputDir)
    .filter((name) => name.endsWith('.json') && name !== 'review-bundle.json')
    .sort();

  return files.map((name) => {
    const path = resolve(inputDir, name);
    const payload = JSON.parse(readFileSync(path, 'utf8'));
    return {
      file: name,
      class: payload.class,
      entry: payload.entry,
    };
  });
}

function buildSummary(entries) {
  const summary = { fact: 0, observation: 0, pending_confirmation: 0 };
  for (const item of entries) {
    if (summary[item.class] !== undefined) {
      summary[item.class] += 1;
    }
  }
  return summary;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const output = options.output || resolve(options.inputDir, 'review-bundle.json');
  const entries = readSuggestions(options.inputDir);
  const bundle = {
    schema: 'mip-suggestion-bundle-draft/v0.1',
    created_at: new Date().toISOString(),
    input_dir: options.inputDir,
    summary: buildSummary(entries),
    suggestions: entries,
  };

  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(bundle, null, 2)}\n`, 'utf8');
  console.log(`Generated suggestion bundle ${output}`);
}

main();
