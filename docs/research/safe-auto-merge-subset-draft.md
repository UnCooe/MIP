# Safe Auto-Merge Subset Draft

- Status: Draft
- Scope: early Route 2 gating policy for future apply behavior

## Goal

Define a narrow subset of fact suggestions that are low-risk enough to be considered for future apply semantics.

## Current Draft Policy

Allowed target paths:

- `facts.*`
- `preferences.response_style`
- `preferences.formality`
- `preferences.code_comments_language`
- `preferences.variable_names_language`

Allowed source categories:

- `user_statement`
- `explicit_user_input`
- `project_activity`
- `verified_tooling`

## Why Narrow

A broad policy would recreate the original problem in a cleaner format: the system would still be too willing to turn partial evidence into stable memory.

The draft intentionally excludes:

- identity fields
- long-term goals
- personality labels
- worldview or relationship claims
- any inferred update that would overwrite stable user-controlled declarations

## Current Use

This policy is currently consumed by `plan apply`.
It does not mutate memory. It only classifies whether a fact suggestion is inside the early safe subset or should remain review-only.
