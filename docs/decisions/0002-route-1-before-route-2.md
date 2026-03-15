# 0002 - Route 1 Before Route 2

- Status: Accepted
- Date: 2026-03-15

## Context

The project identified two meaningful routes:

- Route 1: portable user context that external agents can reliably read
- Route 2: governed writeback and longer-term memory evolution

There was a temptation to tackle both at once.

## Decision

MIP will validate route 1 first and design route 2 in parallel without making it a prerequisite for near-term usefulness.

## Why

Route 1 proves the most basic claim:
A user-controlled source of truth can be rendered into real agent entry points and improve continuity across tools.

Route 2 is more ambitious and more dangerous.
Without explicit write classes, conflict rules, and auditability, automatic writeback would create memory corruption instead of value.

Trying to fully solve route 2 too early would likely:
- blur scope
- slow validation
- encourage overclaiming
- create unstable protocol semantics

## Consequences

- Short-term implementation should focus on read paths and platform adapters.
- Writeback rules can be documented now, but should remain governed and limited.
- Public roadmap should make the stage distinction explicit.