import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { loadMemory } from "./build-context.mjs";
import {
  SAFE_FACT_PATHS,
  SAFE_FACT_PREFIXES,
  SAFE_FACT_SOURCES,
  getMergeStrategy,
  isSafeFactTargetPath,
} from "./route2-policy.mjs";

const ORDER = ["fact", "observation", "pending_confirmation"];

function getTargetPath(item) {
  return item.entry.target_path || "";
}

function getDisplayLabel(item) {
  return item.entry.target_path || item.entry.key || "(missing_target_path)";
}

function parseArgs(argv) {
  const options = {
    input: resolve(process.cwd(), ".mip-suggestions", "review-bundle.json"),
    memory: resolve(homedir(), ".mip", "memory.json"),
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
    if (arg === "--memory" && argv[index + 1]) {
      options.memory = resolve(argv[index + 1]);
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
  node .\\scripts\\plan-apply.mjs [--input <bundle-path>] [--memory <memory-path>] [--format <text|json>] [--output <path>]

Defaults:
  --input ${resolve(process.cwd(), ".mip-suggestions", "review-bundle.json")}
  --memory ${resolve(homedir(), ".mip", "memory.json")}
  --format text`);
}

function loadBundle(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function tryLoadMemory(path) {
  try {
    return {
      exists: true,
      path,
      memory: loadMemory(path),
    };
  } catch (error) {
    return {
      exists: false,
      path,
      error: error instanceof Error ? error.message : String(error),
      memory: null,
    };
  }
}

function getFactEntry(memory, targetPath) {
  const facts = Array.isArray(memory?.facts) ? memory.facts : [];
  return facts.find((entry) => entry?.target_path === targetPath) ?? null;
}

function getScalarValue(memory, targetPath) {
  const segments = targetPath.split(".");
  let current = memory;
  for (const segment of segments) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

function getCurrentValue(memory, targetPath, mergeStrategy) {
  if (!memory || !targetPath || !mergeStrategy) {
    return { exists: false, value: undefined };
  }

  if (mergeStrategy === "upsert_by_target_path") {
    const entry = getFactEntry(memory, targetPath);
    if (!entry) {
      return { exists: false, value: undefined };
    }
    return { exists: true, value: entry.value };
  }

  if (mergeStrategy === "replace_scalar") {
    const value = getScalarValue(memory, targetPath);
    if (value === undefined) {
      return { exists: false, value: undefined };
    }
    return { exists: true, value };
  }

  return { exists: false, value: undefined };
}

function valuesEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function classifyCurrentState(item, decision, memoryState) {
  if (decision.status !== "eligible_for_future_apply") {
    return {
      status: "not_applicable",
      rationale: "Current-memory diff is only evaluated for future-apply candidates.",
      current_value: undefined,
    };
  }

  if (!memoryState.exists || !memoryState.memory) {
    return {
      status: "memory_unavailable",
      rationale: "Memory source could not be loaded, so apply readiness cannot be compared against current state.",
      current_value: undefined,
    };
  }

  const targetPath = getTargetPath(item);
  const mergeStrategy = getMergeStrategy(targetPath);
  const current = getCurrentValue(memoryState.memory, targetPath, mergeStrategy);

  if (!current.exists) {
    return {
      status: "apply_ready",
      rationale: "No current value exists at the target path for the configured merge strategy.",
      current_value: undefined,
    };
  }

  if (valuesEqual(current.value, item.entry.value)) {
    return {
      status: "no_op",
      rationale: "Current memory already matches the suggested value.",
      current_value: current.value,
    };
  }

  return {
    status: "conflict",
    rationale: "Current memory already contains a different value at the target path.",
    current_value: current.value,
  };
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

function buildPlan(bundle, inputPath, memoryState) {
  const plan = {
    schema: "mip-apply-plan-draft/v0.1",
    input_bundle: inputPath,
    memory_source: {
      path: memoryState.path,
      loaded: memoryState.exists,
      error: memoryState.exists ? null : memoryState.error,
    },
    created_at: new Date().toISOString(),
    summary: {
      eligible_for_future_apply: 0,
      review_only: 0,
      confirmation_required: 0,
      blocked: 0,
      apply_ready: 0,
      no_op: 0,
      conflict: 0,
      memory_unavailable: 0,
    },
    policy: {
      safe_fact_prefixes: SAFE_FACT_PREFIXES,
      safe_fact_paths: Array.from(SAFE_FACT_PATHS),
      safe_fact_sources: Array.from(SAFE_FACT_SOURCES),
      merge_strategies: {
        "facts.*": "upsert_by_target_path",
        "preferences.response_style": "replace_scalar",
        "preferences.formality": "replace_scalar",
        "preferences.code_comments_language": "replace_scalar",
        "preferences.variable_names_language": "replace_scalar",
      },
    },
    sections: {
      fact: [],
      observation: [],
      pending_confirmation: [],
    },
  };

  for (const item of bundle.suggestions ?? []) {
    const decision = classifySuggestion(item);
    const currentState = classifyCurrentState(item, decision, memoryState);
    plan.summary[decision.status] += 1;
    if (currentState.status !== "not_applicable") {
      plan.summary[currentState.status] += 1;
    }
    const targetSection = plan.sections[item.class] ?? [];
    targetSection.push({
      file: item.file,
      target_path: getTargetPath(item),
      display_label: getDisplayLabel(item),
      value: item.entry.value,
      source: item.entry.source,
      decision: decision.status,
      rationale: decision.rationale,
      merge_strategy: getMergeStrategy(getTargetPath(item)),
      current_state: currentState.status,
      current_rationale: currentState.rationale,
      current_value: currentState.current_value,
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
    `Memory source: ${plan.memory_source.path} (${plan.memory_source.loaded ? "loaded" : "unavailable"})`,
    `Created: ${plan.created_at}`,
    `Summary: eligible_for_future_apply=${plan.summary.eligible_for_future_apply}, review_only=${plan.summary.review_only}, confirmation_required=${plan.summary.confirmation_required}, blocked=${plan.summary.blocked}`,
    `Current state summary: apply_ready=${plan.summary.apply_ready}, no_op=${plan.summary.no_op}, conflict=${plan.summary.conflict}, memory_unavailable=${plan.summary.memory_unavailable}`,
    `Safe fact prefixes: ${plan.policy.safe_fact_prefixes.join(", ")}`,
    `Safe fact paths: ${plan.policy.safe_fact_paths.join(", ")}`,
    `Safe fact sources: ${plan.policy.safe_fact_sources.join(", ")}`,
  ];
  if (!plan.memory_source.loaded && plan.memory_source.error) {
    lines.push(`Memory source error: ${plan.memory_source.error}`);
  }

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
      if (item.merge_strategy) {
        lines.push(`  merge_strategy: ${item.merge_strategy}`);
      }
      lines.push(`  current_state: ${item.current_state}`);
      lines.push(`  current_rationale: ${item.current_rationale}`);
      if (item.current_value !== undefined) {
        lines.push(`  current_value: ${JSON.stringify(item.current_value)}`);
      }
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
  const memoryState = tryLoadMemory(options.memory);
  const plan = buildPlan(bundle, options.input, memoryState);
  const output = renderOutput(plan, options.format);

  if (options.output) {
    writeFileSync(options.output, output, "utf8");
    console.log(`Wrote ${options.format} apply plan to ${options.output}`);
    return;
  }

  process.stdout.write(output);
}

main();
