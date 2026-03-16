# Merge Semantics Draft

- Status: Draft
- Scope: path-specific merge rules for the early safe auto-merge subset

## Goal

Make future apply behavior explicit before any mutation command lands.

## Current Draft Rules

- `facts.*` -> `upsert_by_target_path`
- `preferences.response_style` -> `replace_scalar`
- `preferences.formality` -> `replace_scalar`
- `preferences.code_comments_language` -> `replace_scalar`
- `preferences.variable_names_language` -> `replace_scalar`

## Rationale

`facts.*` behaves more like a keyed collection and should not be treated like a single scalar slot.
The allowed `preferences.*` fields are scalar declarations and should replace the previous value directly if they are ever applied.

## Current Use

The policy is currently surfaced through `plan apply`.
It still does not mutate memory. It only makes future merge intent visible.
