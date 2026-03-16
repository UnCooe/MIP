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

function isSafeFactTargetPath(targetPath) {
  if (SAFE_FACT_PATHS.has(targetPath)) {
    return true;
  }
  return SAFE_FACT_PREFIXES.some((prefix) => targetPath.startsWith(prefix));
}

function getMergeStrategy(targetPath) {
  if (!targetPath) {
    return null;
  }

  if (targetPath.startsWith("facts.")) {
    return "upsert_by_target_path";
  }

  if (SAFE_FACT_PATHS.has(targetPath)) {
    return "replace_scalar";
  }

  return null;
}

export {
  SAFE_FACT_PATHS,
  SAFE_FACT_PREFIXES,
  SAFE_FACT_SOURCES,
  getMergeStrategy,
  isSafeFactTargetPath,
};
