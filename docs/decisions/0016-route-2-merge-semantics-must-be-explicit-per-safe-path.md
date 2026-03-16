# 0016 - Route 2 Merge Semantics Must Be Explicit Per Safe Path

- Status: Accepted
- Date: 2026-03-16

## Context

Route 2 already has:

- addressable suggestions through `target_path`
- a safe auto-merge subset
- non-mutating planning

What it still lacked was merge semantics.
Even inside a safe subset, different paths need different behavior.

## Decision

Route 2 will define explicit merge semantics for each safe-path category instead of relying on a hidden default.

Current draft semantics:

- `facts.*` -> `upsert_by_target_path`
- `preferences.response_style` -> `replace_scalar`
- `preferences.formality` -> `replace_scalar`
- `preferences.code_comments_language` -> `replace_scalar`
- `preferences.variable_names_language` -> `replace_scalar`

## Why

This prevents two common failures:

- silently appending where replacement was intended
- silently replacing where append or upsert was intended

The point is not to make apply larger. The point is to keep future apply narrow and predictable.

## Consequences

- `plan apply` can now expose not only eligibility but also intended merge behavior
- future apply work can reuse a shared policy layer instead of duplicating path logic
- expanding the safe subset now also requires an explicit merge-semantics decision
