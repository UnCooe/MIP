import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getMipPath } from "./mip-paths.mjs";

function parseArgs(argv) {
  const options = {
    input: getMipPath("intake", "intake-draft.json"),
    output: getMipPath("memory.json"),
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
    if (arg === "--help") {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node .\\scripts\\build-initial-memory.mjs [--input <intake-draft.json>] [--output <memory.json>]

Defaults:
  --input  ${getMipPath("intake", "intake-draft.json")}
  --output ${getMipPath("memory.json")}`);
}

function loadDraft(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function pruneEmpty(value) {
  if (Array.isArray(value)) {
    const next = value.map(pruneEmpty).filter((item) => item !== undefined);
    return next.length > 0 ? next : undefined;
  }

  if (value && typeof value === "object") {
    const next = {};
    for (const [key, entry] of Object.entries(value)) {
      const pruned = pruneEmpty(entry);
      if (pruned !== undefined) {
        next[key] = pruned;
      }
    }
    return Object.keys(next).length > 0 ? next : undefined;
  }

  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
}

function buildInitialMemory(draft) {
  const base = draft.proposed_memory ?? {};
  const memory = {
    $schema: base.$schema || "https://mip-protocol.org/v0.1/schema.json",
    version: base.version || "0.1.0",
    identity: pruneEmpty(base.identity) || undefined,
    preferences: pruneEmpty(base.preferences) || undefined,
    custom: pruneEmpty(base.custom) || undefined,
    facts: pruneEmpty(base.facts) || undefined,
    observations: pruneEmpty(base.observations) || undefined,
    pending_confirmation: pruneEmpty(base.pending_confirmation) || undefined,
  };

  return pruneEmpty(memory);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const draft = loadDraft(options.input);
  const memory = buildInitialMemory(draft);

  mkdirSync(dirname(options.output), { recursive: true });
  writeFileSync(options.output, `${JSON.stringify(memory, null, 2)}\n`, "utf8");
  console.log(`Generated initial memory ${options.output} from ${options.input}`);
}

main();
