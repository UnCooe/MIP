import { homedir } from "node:os";
import { resolve } from "node:path";
import { inspectAgentsFile, syncProjectContext, updateAgentsFile } from "./init-codex.mjs";
import { spawnSync } from "node:child_process";

function printHelp() {
  console.log(`Usage:
  node .\\scripts\\mip.mjs <command> <target> [options]

Commands:
  init codex         Generate MIP-CONTEXT.md and add or update the MIP block in AGENTS.md
  sync codex         Regenerate MIP-CONTEXT.md only
  check codex        Inspect AGENTS.md and report likely integration or conflict risks
  init antigravity   Experimental: use the same project-local files observed to work in local testing
  sync antigravity   Experimental: regenerate MIP-CONTEXT.md only
  check antigravity  Experimental: inspect AGENTS.md and report likely integration or conflict risks
  suggest <class>    Generate a governed-writeback suggestion file
  pack suggestions   Bundle current suggestion files into a review artifact
  review bundle      Print a human-readable summary from a review bundle
  plan apply         Build a non-mutating apply plan from a review bundle
  draft approval     Build a non-mutating approval artifact from an apply plan

Suggestion classes:
  fact | observation | pending_confirmation

Options:
  --input <path>       Memory source file or bundle path when reviewing (default varies by command)
  --memory <path>      Memory source file for apply planning diff (default: ~/.mip/memory.json)
  --cwd <path>         Target project directory (default: current working directory)
  --force              Allow AGENTS.md block append when no markers exist
  --target-path <path> Logical memory path for suggestion generation
  --key <path>         Deprecated alias for --target-path
  --value <text>       Suggestion value
  --source <text>      Suggestion source label
  --notes <text>       Optional suggestion note
  --evidence <text>    Required for fact suggestions
  --confidence <0-1>   Required for observation suggestions
  --reason <text>      Required for pending_confirmation suggestions
  --output <path>      Optional explicit output path
  --input-dir <path>   Optional suggestion directory for pack
  --format <type>      Review output format: text or markdown
`);
}

function parseArgs(argv) {
  const options = {
    help: argv.includes("--help"),
    command: argv[0],
    target: argv[1],
    input: resolve(homedir(), ".mip", "memory.json"),
    cwd: process.cwd(),
    force: false,
    passthrough: [],
  };

  for (let index = 2; index < argv.length; index += 1) {
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
    options.passthrough.push(arg);
    if (argv[index + 1] && !argv[index + 1].startsWith("--")) {
      options.passthrough.push(argv[index + 1]);
      index += 1;
    }
  }

  return options;
}

function isProjectFileTarget(target) {
  return target === "codex" || target === "antigravity";
}

function printExperimentalNotice(target) {
  if (target === "antigravity") {
    console.log("Antigravity support is currently experimental and based on local project-directory validation, not a fully confirmed official entry-point contract.");
  }
}

function printCheckReport(target, report) {
  console.log(`Target: ${target}`);
  console.log(`AGENTS.md path: ${report.agentsPath}`);
  console.log(`AGENTS.md exists: ${report.exists ? "yes" : "no"}`);
  console.log(`Current MIP block: ${report.hasCurrentMarkers ? "yes" : "no"}`);
  console.log(`Legacy MIP block: ${report.hasLegacyMarkers ? "yes" : "no"}`);

  if (report.warnings.length === 0) {
    console.log("Warnings: none");
    return;
  }

  console.log("Warnings:");
  for (const warning of report.warnings) {
    console.log(`- ${warning}`);
  }
}

function runScript(scriptName, args) {
  const scriptPath = resolve(import.meta.dirname, scriptName);
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: process.cwd(),
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function getDefaultBundlePath() {
  return resolve(process.cwd(), ".mip-suggestions", "review-bundle.json");
}

function getBundleScriptArgs(options) {
  const defaultMemoryInput = resolve(homedir(), ".mip", "memory.json");
  const input = options.input === defaultMemoryInput ? getDefaultBundlePath() : options.input;
  return ["--input", input, ...options.passthrough];
}

function getApprovalDraftArgs(options) {
  const args = ["--input", options.input || resolve(process.cwd(), "apply-plan.json")];
  if (options.output) {
    args.push("--output", options.output);
  }
  return [...args, ...options.passthrough];
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (!options.command || !options.target) {
    printHelp();
    process.exit(1);
  }

  if (options.command === "suggest") {
    runScript('suggest-memory.mjs', [options.target, ...options.passthrough]);
    return;
  }

  if (options.command === "pack" && options.target === "suggestions") {
    runScript('pack-suggestions.mjs', options.passthrough);
    return;
  }

  if (options.command === "review" && options.target === "bundle") {
    runScript('review-bundle.mjs', getBundleScriptArgs(options));
    return;
  }

  if (options.command === "plan" && options.target === "apply") {
    runScript('plan-apply.mjs', getBundleScriptArgs(options));
    return;
  }

  if (options.command === "draft" && options.target === "approval") {
    runScript("draft-approval.mjs", getApprovalDraftArgs(options));
    return;
  }

  if (!isProjectFileTarget(options.target)) {
    throw new Error(`Unsupported target: ${options.target}`);
  }

  printExperimentalNotice(options.target);

  if (options.command === "check") {
    const report = inspectAgentsFile(options.cwd);
    printCheckReport(options.target, report);
    return;
  }

  if (options.command === "sync") {
    const output = syncProjectContext(options);
    console.log(`Generated ${output} from ${options.input}`);
    return;
  }

  if (options.command === "init") {
    const output = syncProjectContext(options);
    const status = updateAgentsFile(options.cwd, { force: options.force });
    console.log(`Generated ${output} from ${options.input}`);
    console.log(`${options.target} project initialized in ${options.cwd} (${status} AGENTS.md block).`);
    return;
  }

  throw new Error(`Unsupported command: ${options.command}`);
}

main();
