import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

function parseArgs(argv) {
  const options = {
    input: resolve(process.cwd(), "apply-plan.json"),
    output: resolve(process.cwd(), ".mip-approvals", "approval-draft.json"),
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
  node .\\scripts\\draft-approval.mjs [--input <apply-plan.json>] [--output <approval-draft.json>]

Defaults:
  --input  ${resolve(process.cwd(), "apply-plan.json")}
  --output ${resolve(process.cwd(), ".mip-approvals", "approval-draft.json")}`);
}

function loadPlan(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function collectEntries(plan) {
  const sections = Object.values(plan.sections ?? {});
  return sections.flatMap((items) => items ?? []);
}

function toApprovalItem(item) {
  return {
    file: item.file,
    target_path: item.target_path,
    proposed_value: item.value,
    source: item.source,
    merge_strategy: item.merge_strategy ?? null,
    current_state: item.current_state,
    current_value: item.current_value,
    rationale: item.rationale,
    current_rationale: item.current_rationale,
  };
}

function buildApprovalDraft(plan, inputPath) {
  const entries = collectEntries(plan);
  const draft = {
    schema: "mip-approval-draft/v0.1",
    created_at: new Date().toISOString(),
    input_plan: inputPath,
    memory_source: plan.memory_source ?? null,
    policy: plan.policy ?? null,
    ready_for_confirmation: [],
    conflicts: [],
    skipped: {
      no_op: [],
      review_only: [],
      blocked: [],
      confirmation_required: [],
      memory_unavailable: [],
    },
  };

  for (const item of entries) {
    const approvalItem = toApprovalItem(item);
    if (item.current_state === "apply_ready") {
      draft.ready_for_confirmation.push(approvalItem);
      continue;
    }
    if (item.current_state === "conflict") {
      draft.conflicts.push(approvalItem);
      continue;
    }
    if (item.current_state === "no_op") {
      draft.skipped.no_op.push(approvalItem);
      continue;
    }
    if (item.current_state === "memory_unavailable") {
      draft.skipped.memory_unavailable.push(approvalItem);
      continue;
    }
    if (item.decision === "review_only") {
      draft.skipped.review_only.push(approvalItem);
      continue;
    }
    if (item.decision === "blocked") {
      draft.skipped.blocked.push(approvalItem);
      continue;
    }
    if (item.decision === "confirmation_required") {
      draft.skipped.confirmation_required.push(approvalItem);
    }
  }

  return draft;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const plan = loadPlan(options.input);
  const draft = buildApprovalDraft(plan, options.input);

  mkdirSync(dirname(options.output), { recursive: true });
  writeFileSync(options.output, `${JSON.stringify(draft, null, 2)}\n`, "utf8");
  console.log(`Generated approval draft ${options.output} from ${options.input}`);
}

main();
