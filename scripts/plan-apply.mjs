import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ORDER = ["fact", "observation", "pending_confirmation"];
const SAFE_FACT_PREFIXES = ["facts."];
const SAFE_FACT_PATHS = new Set([
  "preferences.response_style",
  "preferences.formality",
  "preferences.code_comments_language",
  "preferences.variable_names_language",
]);
const SAFE_FACT_SOURCES = new Set([
  "user_statement",
  "explicit_user_input",
  "project_activity",
  "verified_tooling",
]);

function getTargetPath(item) {
  return item.entry.target_path || "";
}

function getDisplayLabel(item) {
  return item.entry.target_path || item.entry.key || "(missing_target_path)";
}

function isSafeFactTargetPath(targetPath) {
  if (SAFE_FACT_PATHS.has(targetPath)) {
    return true;
  }
  return SAFE_FACT_PREFIXES.some((prefix) => targetPath.startsWith(prefix));
}

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

  if (options.format !== "text" && options.format !== "json") {
    throw new Error(`Unsupported format: ${options.format}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage:
  node .\\scripts\\plan-apply.mjs [--input <bundle-path>] [--format <text|json>] [--output <path>]

Defaults:
  --input ${resolve(process.cwd(), ".mip-suggestions", "review-bundle.json")}
  --format text`);
}

function loadBundle(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function classifySuggestion(item) {
  const targetPath = getTargetPath(item);
  if (!targetPath) {
    return {
      status: "blocked",
      rationale: "Suggestion is missing target_path, so it cannot be mapped back into user-controlled memory safely.",
    };
  }

  if (item.class === "fact") {
    if (!item.entry.evidence || !item.entry.source) {
      return {
        status: "blocked",
        rationale: "Fact suggestions must include target_path, evidence, and source metadata before any future apply step.",
      };
    }

    if (!SAFE_FACT_SOURCES.has(item.entry.source)) {
      return {
        status: "review_only",
        rationale: `Fact suggestion source '${item.entry.source}' is outside the current safe auto-merge source set.`,
      };
    }

    if (!isSafeFactTargetPath(targetPath)) {
      return {
        status: "review_only",
        rationale: `Fact target_path '${targetPath}' is outside the current safe auto-merge subset.`,
      };
    }

    return {
      status: "eligible_for_future_apply",
      rationale: "Fact suggestion is inside the current safe auto-merge subset and includes target_path, evidence, and source metadata.",
    };
  }

  if (item.class === "observation") {
    return {
      status: "review_only",
      rationale: "Observations are inferential and must not overwrite stable memory directly.",
    };
  }

  return {
    status: "confirmation_required",
    rationale: "Pending confirmation items are high-risk or conflicting by design.",
  };
}

function buildPlan(bundle, inputPath) {
  const plan = {
    schema: "mip-apply-plan-draft/v0.1",
    input_bundle: inputPath,
    created_at: new Date().toISOString(),
    summary: {
      eligible_for_future_apply: 0,
      review_only: 0,
      confirmation_required: 0,
      blocked: 0,
    },
    policy: {
      safe_fact_prefixes: SAFE_FACT_PREFIXES,
      safe_fact_paths: Array.from(SAFE_FACT_PATHS),
      safe_fact_sources: Array.from(SAFE_FACT_SOURCES),
    },
    sections: {
      fact: [],
      observation: [],
      pending_confirmation: [],
    },
  };

  for (const item of bundle.suggestions ?? []) {
    const decision = classifySuggestion(item);
    plan.summary[decision.status] += 1;
    const targetSection = plan.sections[item.class] ?? [];
    targetSection.push({
      file: item.file,
      target_path: getTargetPath(item),
      display_label: getDisplayLabel(item),
      value: item.entry.value,
      source: item.entry.source,
      decision: decision.status,
      rationale: decision.rationale,
    });
    plan.sections[item.class] = targetSection;
  }

  return plan;
}

function renderText(plan) {
  const lines = [
    "# MIP Apply Plan",
    "",
    `Input bundle: ${plan.input_bundle}`,
    `Created: ${plan.created_at}`,
    `Summary: eligible_for_future_apply=${plan.summary.eligible_for_future_apply}, review_only=${plan.summary.review_only}, confirmation_required=${plan.summary.confirmation_required}, blocked=${plan.summary.blocked}`,
    `Safe fact prefixes: ${plan.policy.safe_fact_prefixes.join(", ")}`,
    `Safe fact paths: ${plan.policy.safe_fact_paths.join(", ")}`,
    `Safe fact sources: ${plan.policy.safe_fact_sources.join(", ")}`,
  ];

  for (const section of ORDER) {
    const items = plan.sections[section] ?? [];
    lines.push("");
    lines.push(`## ${section}`);
    if (items.length === 0) {
      lines.push("- none");
      continue;
    }
    for (const item of items) {
      lines.push(`- ${item.display_label}: ${item.value}`);
      lines.push(`  file: ${item.file}`);
      lines.push(`  source: ${item.source}`);
      lines.push(`  decision: ${item.decision}`);
      lines.push(`  rationale: ${item.rationale}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

function renderOutput(plan, format) {
  if (format === "json") {
    return `${JSON.stringify(plan, null, 2)}\n`;
  }
  return renderText(plan);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const bundle = loadBundle(options.input);
  const plan = buildPlan(bundle, options.input);
  const output = renderOutput(plan, options.format);

  if (options.output) {
    writeFileSync(options.output, output, "utf8");
    console.log(`Wrote ${options.format} apply plan to ${options.output}`);
    return;
  }

  process.stdout.write(output);
}

main();
