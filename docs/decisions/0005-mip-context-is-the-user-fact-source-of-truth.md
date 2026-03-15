# 0005 - MIP Context Is The User Fact Source Of Truth

- Status: Accepted
- Date: 2026-03-15

## Context

Early Route 1 testing exposed a practical issue: a project may contain more than one file that looks like user context. For example, a manually created `user.md` may conflict with `MIP-CONTEXT.md`.

Without a clear priority rule, external agents can drift between multiple competing sources and produce unstable behavior.

## Decision

For a MIP-integrated project:
- `MIP-CONTEXT.md` is the canonical user fact source of truth inside the project
- `AGENTS.md` is the routing and policy layer, not the canonical store of user facts
- other user-information files are non-authoritative unless explicitly declared otherwise

## Why

This separation keeps responsibilities clear:
- `memory.json` is the editable source
- `MIP-CONTEXT.md` is the rendered project-local user context
- `AGENTS.md` tells the agent where the truth source is and how conflicts should be handled

If all three files can independently carry user facts, the integration becomes fragile and contradictory.

## Consequences

- conflict tests should expect agents to prefer `MIP-CONTEXT.md`
- future renderers for other targets should preserve the same separation of roles
- project-specific user notes should either be removed or clearly marked as non-authoritative