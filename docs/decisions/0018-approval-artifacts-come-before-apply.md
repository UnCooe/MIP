# 0018 - Approval Artifacts Come Before Apply

- Status: Accepted
- Date: 2026-03-16

## Context

Route 2 planning can now classify:

- eligibility
- merge strategy
- current-memory diff state

That still leaves a practical gap.
If those results only exist in terminal output or an apply-plan JSON file, there is no explicit object for user confirmation and conflict review.

## Decision

Before any future apply command exists, MIP will support a separate approval artifact generated from the apply plan.

## Why

This keeps confirmation and conflict handling explicit.
It also avoids collapsing preflight analysis and user approval into one opaque step.

## Consequences

- `draft approval` becomes the bridge between planning and any future mutation
- `apply_ready` items can be grouped separately from `conflict`, `no_op`, and other skipped states
- future apply work can require an approval artifact instead of reading terminal output or re-deriving intent
