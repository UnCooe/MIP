import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const CLASSES = new Set(["fact", "observation", "pending_confirmation"]);

function parseArgs(argv) {
  const options = {
    className: argv[0],
    key: "",
    value: "",
    source: "manual",
    notes: "",
    evidence: "",
    confidence: "",
    reason: "",
    output: "",
  };

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--key" && argv[index + 1]) {
      options.key = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--value" && argv[index + 1]) {
      options.value = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--source" && argv[index + 1]) {
      options.source = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--notes" && argv[index + 1]) {
      options.notes = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--evidence" && argv[index + 1]) {
      options.evidence = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--confidence" && argv[index + 1]) {
      options.confidence = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--reason" && argv[index + 1]) {
      options.reason = argv[index + 1];
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
  node .\\scripts\\suggest-memory.mjs <fact|observation|pending_confirmation> --key <key> --value <value> [options]

Options:
  --source <text>      Source label (default: manual)
  --notes <text>       Optional note
  --evidence <text>    Required for fact
  --confidence <0-1>   Required for observation
  --reason <text>      Required for pending_confirmation
  --output <path>      Optional explicit output path
`);
}

function ensureValid(options) {
  if (!CLASSES.has(options.className)) {
    throw new Error(`Unsupported suggestion class: ${options.className}`);
  }
  if (!options.key || !options.value) {
    throw new Error("Both --key and --value are required.");
  }
  if (options.className === "fact" && !options.evidence) {
    throw new Error("--evidence is required for fact suggestions.");
  }
  if (options.className === "observation") {
    const confidence = Number(options.confidence);
    if (Number.isNaN(confidence) || confidence < 0 || confidence > 1) {
      throw new Error("--confidence between 0 and 1 is required for observation suggestions.");
    }
  }
  if (options.className === "pending_confirmation" && !options.reason) {
    throw new Error("--reason is required for pending_confirmation suggestions.");
  }
}

function getDefaultOutputPath(className) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return resolve(process.cwd(), ".mip-suggestions", `${stamp}-${className}.json`);
}

function buildEntry(options) {
  const entry = {
    key: options.key,
    value: options.value,
    source: options.source,
    updated_at: new Date().toISOString(),
  };

  if (options.notes) {
    entry.notes = options.notes;
  }

  if (options.className === "fact") {
    entry.evidence = options.evidence;
  }

  if (options.className === "observation") {
    entry.confidence = Number(options.confidence);
  }

  if (options.className === "pending_confirmation") {
    entry.reason = options.reason;
  }

  return entry;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  ensureValid(options);

  const outputPath = options.output || getDefaultOutputPath(options.className);
  const payload = {
    schema: "mip-suggestion-draft/v0.1",
    class: options.className,
    entry: buildEntry(options),
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Generated suggestion ${outputPath}`);
}

main();