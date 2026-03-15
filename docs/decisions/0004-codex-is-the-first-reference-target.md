# 0004 - Codex Is The First Reference Target

- Status: Accepted
- Date: 2026-03-15

## Context

Route 1 needs at least one end-to-end validated target.
Claude Code was not currently available for hands-on validation in this workspace. Cursor and Antigravity remained candidates, but Codex had the clearest confirmed project-level entry point through `AGENTS.md` and could be tested immediately.

## Decision

Codex becomes the first reference target for Route 1 validation.

The initial Codex workflow is:
- source of truth: `~/.mip/memory.json`
- generated project context: `MIP-CONTEXT.md`
- Codex entry point: `AGENTS.md`
- initialization command: `node .\\scripts\\init-codex.mjs`

## Why

This target is strong enough to prove the core chain:
- one user-controlled source can be rendered
- the render lands in a known Codex-readable location
- the project keeps user context separate from project-specific rules
- repeated sync can be made idempotent instead of manual

Starting with Codex also exposes practical integration issues early, such as:
- preserving existing `AGENTS.md` content
- avoiding duplicate MIP blocks
- handling BOM and file formatting edge cases

## Consequences

- Codex becomes the first implementation benchmark for `render/init/sync`
- Future targets should be compared against this baseline
- Route 1 documentation should treat Codex support as validated before claiming broader support