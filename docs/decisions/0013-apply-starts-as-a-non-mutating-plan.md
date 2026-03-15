# 0013 - Apply Starts As A Non-Mutating Plan

- Status: Accepted
- Date: 2026-03-15

## Context

Route 2 already has suggestion generation, bundling, and human-readable review.
The next tempting step is direct apply behavior, but that would collapse several different risk levels into one mutation path.

## Decision

Before any future write command is introduced, MIP will expose `plan apply` as a non-mutating gate.

## Why

The project still lacks enough structure to safely map arbitrary suggestion keys back into the user-controlled source of truth.
Jumping directly to file mutation would create false confidence and hide the boundary between:

- low-risk factual candidates
- review-only inferences
- items that require explicit confirmation

## Consequences

- Route 2 sequence becomes suggest -> pack -> review -> plan apply -> future apply
- the system can classify candidate updates without pretending it already knows how to merge them safely
- direct apply remains intentionally blocked until merge semantics are explicit
