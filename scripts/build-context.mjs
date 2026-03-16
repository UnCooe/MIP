import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { hasRenderableEntries, splitMemoryForConsultation } from "./read-policy.mjs";

function parseArgs(argv) {
  const options = {
    input: resolve(homedir(), ".mip", "memory.json"),
    output: resolve(process.cwd(), "MIP-CONTEXT.md"),
    title: "User MIP Context",
    mode: "selective",
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
    if (arg === "--mode" && argv[index + 1]) {
      options.mode = argv[index + 1];
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
  node .\\scripts\\build-context.mjs [--input <path>] [--output <path>] [--title <text>] [--mode <selective|full>]

Defaults:
  --input  ${resolve(homedir(), ".mip", "memory.json")}
  --output ${resolve(process.cwd(), "MIP-CONTEXT.md")}
  --mode   selective`);
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

function renderArraySection(title, items) {
  const lines = [`## ${title}`];

  if (!items || items.length === 0) {
    lines.push("- None");
    return lines.join("\n");
  }

  for (const item of items) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const label = item.target_path || item.key || "item";
      const value = item.value !== undefined ? normalizeValue(item.value) : JSON.stringify(item);
      lines.push(`- ${label}: ${value}`);
      for (const [key, raw] of Object.entries(item)) {
        if (key === "target_path" || key === "key" || key === "value") {
          continue;
        }
        if (raw === undefined || raw === null || raw === "") {
          continue;
        }
        lines.push(`  - ${key}: ${normalizeValue(raw)}`);
      }
      continue;
    }

    lines.push(`- ${normalizeValue(item)}`);
  }

  return lines.join("\n");
}

function renderSection(title, data) {
  if (Array.isArray(data)) {
    return renderArraySection(title, data);
  }

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

function renderSelectiveContext(memory, options) {
  const { alwaysOn, onDemand, policy } = splitMemoryForConsultation(memory);
  const sections = [
    `# ${options.title}`,
    "",
    "This file is generated from the user's MIP source of truth.",
    "Use the Always-On Guidance section by default.",
    "Consult On-Demand sections only when the current task depends on them.",
    "If local history or inferred memory conflicts with this file, prefer this file for stable preferences and explicit self-corrections.",
    "Use confirmation before changing high-risk identity claims or long-term preferences.",
    "",
    renderSection("Always-On Preferences", alwaysOn.preferences),
    "",
    renderSection("Always-On Corrections And Work Style", alwaysOn.custom),
    "",
    "## Active Read Policy",
    `- always_on_preferences: ${Array.from(policy.always_on_preferences).join(", ") || "None"}`,
    `- always_on_custom: ${Array.from(policy.always_on_custom).join(", ") || "None"}`,
    "",
    "## On-Demand Sections",
  ];

  const onDemandIndex = [];
  if (hasRenderableEntries(onDemand.identity)) {
    onDemandIndex.push("- Identity");
  }
  if (hasRenderableEntries(onDemand.preferences)) {
    onDemandIndex.push("- Additional Preferences");
  }
  if (hasRenderableEntries(onDemand.custom)) {
    onDemandIndex.push("- Additional Custom Context");
  }
  if (hasRenderableEntries(onDemand.facts)) {
    onDemandIndex.push("- Facts");
  }
  if (hasRenderableEntries(onDemand.observations)) {
    onDemandIndex.push("- Observations");
  }
  if (hasRenderableEntries(onDemand.pending_confirmation)) {
    onDemandIndex.push("- Pending Confirmation");
  }

  if (onDemandIndex.length === 0) {
    sections.push("- None");
  } else {
    sections.push(...onDemandIndex);
  }

  if (hasRenderableEntries(onDemand.identity)) {
    sections.push("", renderSection("Identity", onDemand.identity));
  }
  if (hasRenderableEntries(onDemand.preferences)) {
    sections.push("", renderSection("Additional Preferences", onDemand.preferences));
  }
  if (hasRenderableEntries(onDemand.custom)) {
    sections.push("", renderSection("Additional Custom Context", onDemand.custom));
  }
  if (hasRenderableEntries(onDemand.facts)) {
    sections.push("", renderSection("Facts", onDemand.facts));
  }
  if (hasRenderableEntries(onDemand.observations)) {
    sections.push("", renderSection("Observations", onDemand.observations));
  }
  if (hasRenderableEntries(onDemand.pending_confirmation)) {
    sections.push("", renderSection("Pending Confirmation", onDemand.pending_confirmation));
  }

  return `${sections.join("\n")}\n`;
}

function renderFullContext(memory, options) {
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

export function buildContext(memory, options) {
  if (options.mode === "full") {
    return renderFullContext(memory, options);
  }
  return renderSelectiveContext(memory, options);
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
