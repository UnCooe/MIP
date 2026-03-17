import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { getMipPath } from "./mip-paths.mjs";

const SCHEMA = "mip-intake-draft/v0.1";

const FIELD_MAP = new Map([
  ["name", { target: "identity.name" }],
  ["language", { target: "identity.language" }],
  ["locale", { target: "identity.language" }],
  ["timezone", { target: "identity.timezone" }],
  ["role", { target: "identity.role" }],
  ["title", { target: "identity.role" }],
  ["industry", { target: "identity.industry" }],
  ["tech_stack", { target: "identity.tech_stack", array: true }],
  ["stack", { target: "identity.tech_stack", array: true }],
  ["skills", { target: "identity.tech_stack", array: true }],
  ["response_style", { target: "preferences.response_style" }],
  ["formality", { target: "preferences.formality" }],
  ["code_comments_language", { target: "preferences.code_comments_language" }],
  ["variable_names_language", { target: "preferences.variable_names_language" }],
  ["explanation_depth", { target: "preferences.explanation_depth" }],
  ["work_style", { target: "custom.work_style" }],
]);

function parseArgs(argv) {
  const options = {
    sourceFiles: [],
    output: getMipPath("intake", "intake-draft.json"),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if ((arg === "--source-file" || arg === "--input") && argv[index + 1]) {
      options.sourceFiles.push(resolve(argv[index + 1]));
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

  if (options.sourceFiles.length === 0) {
    throw new Error("At least one --source-file is required.");
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node .\\scripts\\draft-intake.mjs --source-file <path> [--source-file <path> ...] [--output <path>]

Defaults:
  --output ${getMipPath("intake", "intake-draft.json")}`);
}

function readSource(path) {
  if (!existsSync(path)) {
    throw new Error(`Source file not found: ${path}`);
  }

  return readFileSync(path, "utf8").replace(/^\uFEFF/, "");
}

function normalizeTextValue(value, asArray = false) {
  if (asArray) {
    return value
      .split(/[,/]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value.trim();
}

function ensureContainer(root, key) {
  if (!root[key] || typeof root[key] !== "object" || Array.isArray(root[key])) {
    root[key] = {};
  }
}

function setPath(root, targetPath, value) {
  const [section, field] = targetPath.split(".");
  ensureContainer(root, section);
  root[section][field] = value;
}

function addCandidate(draft, candidate) {
  draft.candidates.push(candidate);
}

function addNote(draft, note) {
  draft.notes.push(note);
}

function handleMappedEntry(draft, sourcePath, key, rawValue, extractionMethod) {
  const mapping = FIELD_MAP.get(key);
  if (!mapping) {
    return false;
  }

  const value = normalizeTextValue(rawValue, mapping.array);
  if ((Array.isArray(value) && value.length === 0) || value === "") {
    return true;
  }

  setPath(draft.proposed_memory, mapping.target, value);
  addCandidate(draft, {
    source_file: sourcePath,
    target_path: mapping.target,
    value,
    trust_level: "user_provided_explicit",
    extraction_method: extractionMethod,
    review_status: "ready_for_review",
  });
  return true;
}

function processStructuredMemoryLike(draft, sourcePath, parsed) {
  const sections = ["identity", "preferences", "custom", "facts", "observations", "pending_confirmation"];

  for (const section of sections) {
    if (parsed[section] === undefined) {
      continue;
    }
    draft.proposed_memory[section] = parsed[section];
    addCandidate(draft, {
      source_file: sourcePath,
      target_path: section,
      value: parsed[section],
      trust_level: "user_provided_explicit",
      extraction_method: "structured_section_copy",
      review_status: "ready_for_review",
    });
  }
}

function processStructuredObject(draft, sourcePath, parsed) {
  if (parsed && typeof parsed === "object" && (parsed.identity || parsed.preferences || parsed.custom)) {
    processStructuredMemoryLike(draft, sourcePath, parsed);
    return;
  }

  for (const [key, value] of Object.entries(parsed ?? {})) {
    if (typeof value === "string" || Array.isArray(value)) {
      handleMappedEntry(draft, sourcePath, key, Array.isArray(value) ? value.join(", ") : value, "structured_key");
    }
  }
}

function processTextSource(draft, sourcePath, text) {
  const lines = text.split(/\r?\n/);
  let matched = 0;

  for (const line of lines) {
    const match = line.match(/^\s*(?:[-*]\s*)?([A-Za-z_]+)\s*:\s*(.+?)\s*$/);
    if (!match) {
      continue;
    }
    const [, rawKey, rawValue] = match;
    const key = rawKey.trim().toLowerCase();
    if (handleMappedEntry(draft, sourcePath, key, rawValue, "line_mapping")) {
      matched += 1;
    }
  }

  if (matched === 0) {
    addNote(draft, {
      source_file: sourcePath,
      message: "No direct field mappings were extracted automatically. This source may still be useful for manual or AI-assisted intake review.",
    });
  }
}

function buildDraft(sourceFiles) {
  const draft = {
    schema: SCHEMA,
    created_at: new Date().toISOString(),
    sources: [],
    proposed_memory: {
      $schema: "https://mip-protocol.org/v0.1/schema.json",
      version: "0.1.0",
    },
    candidates: [],
    notes: [],
  };

  for (const sourcePath of sourceFiles) {
    const text = readSource(sourcePath);
    const sourceRecord = {
      path: sourcePath,
      kind: extname(sourcePath).toLowerCase() || "text",
      trust_level: "user_provided",
    };
    draft.sources.push(sourceRecord);

    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      processStructuredObject(draft, sourcePath, parsed);
      continue;
    }

    processTextSource(draft, sourcePath, text);
  }

  return draft;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const draft = buildDraft(options.sourceFiles);
  mkdirSync(dirname(options.output), { recursive: true });
  writeFileSync(options.output, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
  console.log(`Generated intake draft ${options.output}`);
}

main();
