# 0024 - Guided Intake Produces A Draft Before Initial Memory

- Status: Accepted
- Date: 2026-03-16

## Context

The next usability gap in MIP is initialization.
Users should be able to provide raw materials and get structured help without being forced to think in schema terms from the start.

At the same time, jumping directly from raw materials to final `memory.json` would skip the same governance boundary the project has already established for later writeback.

## Decision

Guided intake should first produce an intake draft, and only then build an initial memory candidate.

## Why

This keeps initialization lightweight without making it opaque.
The draft stage gives the user and the system a place to inspect extracted structure before treating it as the initial source of truth.

## Consequences

- initialization becomes a two-step flow: `draft intake` -> `build memory`
- raw user materials can be accepted without direct blind copying into `memory.json`
- later improvements to extraction logic can evolve the draft stage without destabilizing the final memory format
