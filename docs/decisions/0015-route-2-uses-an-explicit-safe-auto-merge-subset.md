# 0015 - Route 2 Uses An Explicit Safe Auto-Merge Subset

- Status: Accepted
- Date: 2026-03-15

## Context

After introducing `target_path`, Route 2 can now tell where a suggestion wants to land.
That still does not mean every addressable path is safe for future apply behavior.

Identity fields, long-term goals, worldview claims, and similar high-impact paths remain too risky for any early auto-merge semantics.

## Decision

Route 2 will use an explicit safe auto-merge subset instead of heuristic guessing.

Near-term candidates for future apply are limited to:

- `facts.*`
- `preferences.response_style`
- `preferences.formality`
- `preferences.code_comments_language`
- `preferences.variable_names_language`

And only when backed by safe source categories:

- `user_statement`
- `explicit_user_input`
- `project_activity`
- `verified_tooling`

## Why

This keeps Route 2 honest.
The project can now separate:

- addressable suggestions
- reviewable suggestions
- genuinely low-risk merge candidates

without pretending the entire memory model is safe for automation.

## Consequences

- `plan apply` can now distinguish between addressable-but-review-only facts and low-risk future apply candidates
- early apply semantics remain intentionally narrow
- expanding the safe subset becomes a visible design decision, not a silent implementation drift
