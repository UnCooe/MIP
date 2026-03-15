# 0012 - Human-Readable Review Comes Before Apply

- Status: Accepted
- Date: 2026-03-15

## Context

The project can now generate suggestions and pack them into a review bundle. However, a machine-readable bundle is still not an ideal human review surface.

## Decision

Before introducing any future apply command, MIP will provide a human-readable review layer through `mip review bundle`.

## Why

Governed writeback depends on deliberate review. If the workflow jumps from JSON bundle straight to mutation semantics, the project will skip the point where a user or reviewer can comfortably inspect and challenge suggestions.

## Consequences

- Route 2 now has a clearer sequence: suggest -> pack -> review -> future apply
- review output becomes a stable human checkpoint in the workflow
- apply should not land before review is already usable in practice