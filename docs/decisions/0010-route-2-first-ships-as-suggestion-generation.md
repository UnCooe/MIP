# 0010 - Route 2 First Ships As Suggestion Generation

- Status: Accepted
- Date: 2026-03-15

## Context

The project now has a Route 2 extension draft, but still needs an executable workflow that does not jump straight to direct mutation of `memory.json`.

## Decision

The first executable Route 2 command will be `mip suggest`.

It generates a structured suggestion file and stops there.
It does not apply the suggestion to the source of truth automatically.

## Why

This keeps user control intact while giving the project a concrete writeback workflow to test.

Suggestion generation is the narrowest useful bridge between:
- writeback design docs
- real agent behavior
- future approval and apply flows

## Consequences

- Route 2 can be exercised without needing an `apply` command yet
- suggestion file format can evolve before commit semantics are locked in
- future `apply` logic can build on a format that has already been used in practice