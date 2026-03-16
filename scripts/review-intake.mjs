import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function parseArgs(argv) {
  const options = {
    input: resolve(process.cwd(), ".mip-intake", "intake-draft.json"),
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
  node .\\scripts\\review-intake.mjs [--input <intake-draft.json>] [--format <text|markdown>] [--output <path>]

Defaults:
  --input ${resolve(process.cwd(), ".mip-intake", "intake-draft.json")}
  --format text`);
}

function loadDraft(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function renderCandidatesText(candidates) {
  const lines = [];
  for (const candidate of candidates) {
    lines.push(`- ${candidate.target_path}: ${JSON.stringify(candidate.value)}`);
    lines.push(`  source_file: ${candidate.source_file}`);
    lines.push(`  trust_level: ${candidate.trust_level}`);
    lines.push(`  extraction_method: ${candidate.extraction_method}`);
    lines.push(`  review_status: ${candidate.review_status}`);
  }
  return lines;
}

function renderCandidatesMarkdown(candidates) {
  const lines = [];
  for (const candidate of candidates) {
    lines.push(`- **${candidate.target_path}**: ${JSON.stringify(candidate.value)}`);
    lines.push(`  - source_file: \`${candidate.source_file}\``);
    lines.push(`  - trust_level: \`${candidate.trust_level}\``);
    lines.push(`  - extraction_method: \`${candidate.extraction_method}\``);
    lines.push(`  - review_status: \`${candidate.review_status}\``);
  }
  return lines;
}

function renderText(draft, inputPath) {
  const lines = [
    "# MIP Intake Review",
    "",
    `Input draft: ${inputPath}`,
    `Created: ${draft.created_at}`,
    `Sources: ${draft.sources?.length ?? 0}`,
    `Candidates: ${draft.candidates?.length ?? 0}`,
    `Notes: ${draft.notes?.length ?? 0}`,
    "",
    "## Sources",
  ];

  for (const source of draft.sources ?? []) {
    lines.push(`- ${source.path} (${source.kind}, ${source.trust_level})`);
  }

  lines.push("", "## Candidates");
  if ((draft.candidates ?? []).length === 0) {
    lines.push("- none");
  } else {
    lines.push(...renderCandidatesText(draft.candidates));
  }

  lines.push("", "## Proposed Memory");
  lines.push(JSON.stringify(draft.proposed_memory ?? {}, null, 2));

  lines.push("", "## Notes");
  if ((draft.notes ?? []).length === 0) {
    lines.push("- none");
  } else {
    for (const note of draft.notes) {
      lines.push(`- ${note.source_file}: ${note.message}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function renderMarkdown(draft, inputPath) {
  const lines = [
    "# MIP Intake Review",
    "",
    `- Input draft: \`${inputPath}\``,
    `- Created: ${draft.created_at}`,
    `- Sources: ${draft.sources?.length ?? 0}`,
    `- Candidates: ${draft.candidates?.length ?? 0}`,
    `- Notes: ${draft.notes?.length ?? 0}`,
    "",
    "## Sources",
  ];

  for (const source of draft.sources ?? []) {
    lines.push(`- \`${source.path}\` (${source.kind}, ${source.trust_level})`);
  }

  lines.push("", "## Candidates");
  if ((draft.candidates ?? []).length === 0) {
    lines.push("- none");
  } else {
    lines.push(...renderCandidatesMarkdown(draft.candidates));
  }

  lines.push("", "## Proposed Memory");
  lines.push("```json");
  lines.push(JSON.stringify(draft.proposed_memory ?? {}, null, 2));
  lines.push("```");

  lines.push("", "## Notes");
  if ((draft.notes ?? []).length === 0) {
    lines.push("- none");
  } else {
    for (const note of draft.notes) {
      lines.push(`- \`${note.source_file}\`: ${note.message}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const draft = loadDraft(options.input);
  const output = options.format === "markdown" ? renderMarkdown(draft, options.input) : renderText(draft, options.input);

  if (options.output) {
    writeFileSync(options.output, output, "utf8");
    console.log(`Wrote ${options.format} intake review to ${options.output}`);
    return;
  }

  process.stdout.write(output);
}

main();
