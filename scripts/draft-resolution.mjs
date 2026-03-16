import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

function parseArgs(argv) {
  const options = {
    input: resolve(process.cwd(), ".mip-approvals", "approval-draft.json"),
    output: resolve(process.cwd(), ".mip-resolutions", "resolution-draft.json"),
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
  node .\\scripts\\draft-resolution.mjs [--input <approval-draft.json>] [--output <resolution-draft.json>]

Defaults:
  --input  ${resolve(process.cwd(), ".mip-approvals", "approval-draft.json")}
  --output ${resolve(process.cwd(), ".mip-resolutions", "resolution-draft.json")}`);
}

function loadApprovalDraft(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function toReadyDecision(item) {
  return {
    file: item.file,
    target_path: item.target_path,
    proposed_value: item.proposed_value,
    current_state: item.current_state,
    resolution: "pending_confirmation",
    allowed_resolutions: ["approve", "reject"],
    merge_strategy: item.merge_strategy ?? null,
    notes: "",
  };
}

function toConflictDecision(item) {
  return {
    file: item.file,
    target_path: item.target_path,
    proposed_value: item.proposed_value,
    current_value: item.current_value,
    current_state: item.current_state,
    resolution: "pending_conflict_decision",
    allowed_resolutions: ["keep_current", "use_proposed", "manual_edit"],
    merge_strategy: item.merge_strategy ?? null,
    notes: "",
  };
}

function buildResolutionDraft(approvalDraft, inputPath) {
  return {
    schema: "mip-resolution-draft/v0.1",
    created_at: new Date().toISOString(),
    input_approval: inputPath,
    memory_source: approvalDraft.memory_source ?? null,
    policy: approvalDraft.policy ?? null,
    pending_confirmations: (approvalDraft.ready_for_confirmation ?? []).map(toReadyDecision),
    pending_conflicts: (approvalDraft.conflicts ?? []).map(toConflictDecision),
    skipped: approvalDraft.skipped ?? {},
  };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const approvalDraft = loadApprovalDraft(options.input);
  const resolutionDraft = buildResolutionDraft(approvalDraft, options.input);

  mkdirSync(dirname(options.output), { recursive: true });
  writeFileSync(options.output, `${JSON.stringify(resolutionDraft, null, 2)}\n`, "utf8");
  console.log(`Generated resolution draft ${options.output} from ${options.input}`);
}

main();
