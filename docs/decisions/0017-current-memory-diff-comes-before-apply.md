# 0017 - Current Memory Diff Comes Before Apply

- Status: Accepted
- Date: 2026-03-16

## Context

Route 2 already knows:

- whether a suggestion is addressable
- whether it is inside the safe auto-merge subset
- which merge strategy it would use

That still does not answer whether applying it would do anything useful or overwrite an existing value.

## Decision

Before any future apply command exists, `plan apply` must compare eligible suggestions against the current memory source.

It should classify them as:

- `apply_ready`
- `no_op`
- `conflict`
- `memory_unavailable`

## Why

Without a current-memory diff, a future apply workflow would still be blind to the most practical question: does this candidate actually change the user's source of truth.

## Consequences

- `plan apply` now becomes a real preflight step instead of only a static policy classifier
- future apply work can refuse to act on `conflict` and `memory_unavailable` states by default
- no-op suggestions become visible instead of being redundantly treated as pending work
