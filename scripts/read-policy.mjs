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
const RESERVED_CUSTOM_KEYS = new Set(["mip_read_policy"]);

function asKeySet(value) {
  if (!Array.isArray(value)) {
    return null;
  }
  return new Set(value.filter((item) => typeof item === "string" && item.length > 0));
}

function getEffectivePolicy(memory) {
  const configured = memory?.custom?.mip_read_policy ?? {};
  return {
    always_on_preferences: asKeySet(configured.always_on_preferences) ?? ALWAYS_ON_PREFERENCE_KEYS,
    always_on_custom: asKeySet(configured.always_on_custom) ?? ALWAYS_ON_CUSTOM_KEYS,
  };
}

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
    if (!omittedKeys.has(key) && !RESERVED_CUSTOM_KEYS.has(key) && value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  }
  return result;
}

function splitMemoryForConsultation(memory) {
  const policy = getEffectivePolicy(memory);
  const alwaysOn = {
    preferences: pickEntries(memory.preferences, policy.always_on_preferences),
    custom: pickEntries(memory.custom, policy.always_on_custom),
  };

  const onDemand = {
    identity: memory.identity ?? {},
    preferences: omitEntries(memory.preferences, policy.always_on_preferences),
    custom: omitEntries(memory.custom, policy.always_on_custom),
    facts: memory.facts ?? null,
    observations: memory.observations ?? null,
    pending_confirmation: memory.pending_confirmation ?? null,
  };

  return { alwaysOn, onDemand, policy };
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
  RESERVED_CUSTOM_KEYS,
  getEffectivePolicy,
  hasRenderableEntries,
  splitMemoryForConsultation,
};
