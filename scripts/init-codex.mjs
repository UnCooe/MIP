import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { pathToFileURL } from "node:url";
import { buildContext, loadMemory, writeContext } from "./build-context.mjs";

const CURRENT_START_MARKER = "<!-- MIP_USER_CONTEXT:START -->";
const CURRENT_END_MARKER = "<!-- MIP_USER_CONTEXT:END -->";
const LEGACY_START_MARKER = "<!-- MIP:START -->";
const LEGACY_END_MARKER = "<!-- MIP:END -->";
const CONFLICT_PATTERNS = [
  { label: "exclusive_rules", pattern: /only follow this file|ignore other instruction files|do not read external context/i },
  { label: "project_priority", pattern: /project rules (take|have) priority|prefer project instructions/i },
  { label: "user_fact_overlap", pattern: /user profile|user context|user preferences|who the user is/i },
];

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function buildSharedProjectBlock() {
  return [
    CURRENT_START_MARKER,
    "## MIP User Context Source Of Truth",
    "",
    "Read [MIP-CONTEXT.md](./MIP-CONTEXT.md) before making user-specific assumptions.",
    "",
    "Use that file as the user's cross-project source of truth for stable preferences, explicit self-corrections, and user facts.",
    "",
    "If other user-description files conflict with [MIP-CONTEXT.md](./MIP-CONTEXT.md), prefer [MIP-CONTEXT.md](./MIP-CONTEXT.md) unless a higher-priority project rule explicitly overrides it.",
    "",
    "Do not rewrite [MIP-CONTEXT.md](./MIP-CONTEXT.md) directly unless the user explicitly asks for it. Put inferred updates into a separate suggestion artifact first.",
    CURRENT_END_MARKER,
  ].join("\n");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceMarkedBlock(existing, startMarker, endMarker, block) {
  const pattern = new RegExp(`${escapeRegex(startMarker)}[\\s\\S]*?${escapeRegex(endMarker)}`);
  return existing.replace(pattern, block);
}

export function inspectAgentsFile(projectDir) {
  const agentsPath = resolve(projectDir, "AGENTS.md");
  const exists = existsSync(agentsPath);
  const content = exists ? readFileSync(agentsPath, "utf8").replace(/^\uFEFF/, "") : "";
  const hasCurrentMarkers = content.includes(CURRENT_START_MARKER) && content.includes(CURRENT_END_MARKER);
  const hasLegacyMarkers = content.includes(LEGACY_START_MARKER) && content.includes(LEGACY_END_MARKER);
  const warnings = [];

  for (const entry of CONFLICT_PATTERNS) {
    if (entry.pattern.test(content)) {
      warnings.push(entry.label);
    }
  }

  return {
    agentsPath,
    exists,
    hasCurrentMarkers,
    hasLegacyMarkers,
    warnings,
  };
}

export function syncProjectContext({ input, cwd, title = "User MIP Context" }) {
  const memory = loadMemory(input);
  const output = resolve(cwd, "MIP-CONTEXT.md");
  const content = buildContext(memory, { input, output, title });
  writeContext(output, content);
  return output;
}

export function updateAgentsFile(projectDir, { force = false } = {}) {
  const agentsPath = resolve(projectDir, "AGENTS.md");
  const block = buildSharedProjectBlock();
  const existing = existsSync(agentsPath) ? readFileSync(agentsPath, "utf8").replace(/^\uFEFF/, "") : "";

  if (!existing.trim()) {
    const initial = ["# Project Instructions", "", block, ""].join("\n");
    writeFileSync(agentsPath, initial, "utf8");
    return "created";
  }

  const hasCurrentMarkers = existing.includes(CURRENT_START_MARKER) && existing.includes(CURRENT_END_MARKER);
  const hasLegacyMarkers = existing.includes(LEGACY_START_MARKER) && existing.includes(LEGACY_END_MARKER);

  if (hasCurrentMarkers) {
    const next = replaceMarkedBlock(existing, CURRENT_START_MARKER, CURRENT_END_MARKER, block);
    writeFileSync(agentsPath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
    return "updated";
  }

  if (hasLegacyMarkers) {
    const next = replaceMarkedBlock(existing, LEGACY_START_MARKER, LEGACY_END_MARKER, block);
    writeFileSync(agentsPath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
    return "migrated";
  }

  if (!force) {
    const appended = `${existing.trimEnd()}\n\n${block}\n`;
    writeFileSync(agentsPath, appended, "utf8");
    return "appended";
  }

  const replaced = `${existing.trimEnd()}\n\n${block}\n`;
  writeFileSync(agentsPath, replaced, "utf8");
  return "forced";
}

export function syncCodexProject(options) {
  return syncProjectContext(options);
}

function parseArgs(argv) {
  const options = {
    input: resolve(homedir(), ".mip", "memory.json"),
    cwd: process.cwd(),
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      options.input = resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--cwd" && argv[index + 1]) {
      options.cwd = resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--force") {
      options.force = true;
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
  node .\\scripts\\init-codex.mjs [--input <path>] [--cwd <project>] [--force]

Defaults:
  --input ${resolve(homedir(), ".mip", "memory.json")}
  --cwd   ${process.cwd()}`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  ensureDir(options.cwd);
  const output = syncCodexProject(options);
  const status = updateAgentsFile(options.cwd, { force: options.force });
  console.log(`Generated ${output} from ${options.input}`);
  console.log(`Codex project initialized in ${options.cwd} (${status} AGENTS.md block).`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}