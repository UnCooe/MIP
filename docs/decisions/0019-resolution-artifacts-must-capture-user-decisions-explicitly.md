# 0019 - Resolution Artifacts Must Capture User Decisions Explicitly

- Status: Accepted
- Date: 2026-03-16

## Context

Route 2 now has:

- apply planning
- approval artifacts

That still leaves one missing layer: a durable expression of actual user decisions.

Without that layer, a future apply step would still need to infer whether a ready item was approved or a conflict was resolved by keeping current memory, using the proposed value, or requiring manual edit.

## Decision

Before any future apply command exists, MIP will support a separate resolution artifact built from the approval draft.

## Why

This keeps the final decision state explicit and auditable.
It also prevents the approval artifact from turning into an overloaded object that mixes review grouping with resolved outcomes.

## Consequences

- Route 2 now has a clearer handoff: plan -> approval draft -> resolution draft
- future apply work can require explicit resolutions instead of guessing from intermediate artifacts
- conflict handling becomes part of a durable record instead of an implicit UI-only action
