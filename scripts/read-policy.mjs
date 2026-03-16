const ALWAYS_ON_PREFERENCE_KEYS = new Set([
  "response_style",
  "formality",
  "code_comments_language",
  "variable_names_language",
  "explanation_depth",
]);

const ALWAYS_ON_CUSTOM_KEYS = new Set([
  "work_style",
  "self_corrections",
]);

function pickEntries(source, allowedKeys) {
  const result = {};
  for (const [key, value] of Object.entries(source ?? {})) {
    if (allowedKeys.has(key) && value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  }
  return result;
}

function omitEntries(source, omittedKeys) {
  const result = {};
  for (const [key, value] of Object.entries(source ?? {})) {
    if (!omittedKeys.has(key) && value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  }
  return result;
}

function splitMemoryForConsultation(memory) {
  const alwaysOn = {
    preferences: pickEntries(memory.preferences, ALWAYS_ON_PREFERENCE_KEYS),
    custom: pickEntries(memory.custom, ALWAYS_ON_CUSTOM_KEYS),
  };

  const onDemand = {
    identity: memory.identity ?? {},
    preferences: omitEntries(memory.preferences, ALWAYS_ON_PREFERENCE_KEYS),
    custom: omitEntries(memory.custom, ALWAYS_ON_CUSTOM_KEYS),
    facts: memory.facts ?? null,
    observations: memory.observations ?? null,
    pending_confirmation: memory.pending_confirmation ?? null,
  };

  return { alwaysOn, onDemand };
}

function hasRenderableEntries(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (value && typeof value === "object") {
    return Object.keys(value).length > 0;
  }
  return Boolean(value);
}

export {
  ALWAYS_ON_CUSTOM_KEYS,
  ALWAYS_ON_PREFERENCE_KEYS,
  hasRenderableEntries,
  splitMemoryForConsultation,
};
