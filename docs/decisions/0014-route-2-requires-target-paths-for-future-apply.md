# 0014 - Route 2 Requires Target Paths For Future Apply

- Status: Accepted
- Date: 2026-03-15

## Context

Route 2 now has suggestion generation, review, and non-mutating apply planning.
The main blocker for any future apply step is no longer command shape. It is addressability.

Free-form keys like `current_focus` or `communication_style` are readable to humans, but they do not safely identify where a suggestion belongs in the user-controlled memory structure.

## Decision

MIP Route 2 will move from free-form `key` toward explicit `target_path`.

Current tooling will:

- generate `target_path` in new suggestions
- continue reading legacy `key` for compatibility
- treat missing `target_path` as a blocker for future apply eligibility

## Why

Without stable addressing, any future apply step would have to guess where a suggestion should merge.
That would create false precision and make conflicts harder to reason about.

## Consequences

- Route 2 examples and schema drafts now center `target_path`
- review remains backward-compatible with old suggestion files
- plan apply can explicitly block suggestions that are not addressable enough for future merge behavior
