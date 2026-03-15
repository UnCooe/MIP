# 0003 - Route 1 Focuses On Verified Read Paths

- Status: Accepted
- Date: 2026-03-15

## Context

MIP's short-term value depends on external tools reliably consuming user-controlled context.
That requires real entry points, not abstract renderer commands.

A recurring risk in the project was treating `render` as if it automatically produced adoption value. It does not. Value appears only when a render target maps to a documented or validated tool entry point.

## Decision

Route 1 will focus on verified read paths first.

This means:
- target documented global entry points where available
- use project-level files when they are the clearest supported path
- treat MCP as a complementary integration path, not the only path
- avoid claiming stable support for any platform until its entry point is documented or directly validated

## Why

Without this constraint, MIP risks generating dead files that no agent reads.
That would create a false sense of interoperability.

The project needs to validate the chain end to end:
- source of truth exists
- target format is rendered
- file or server is placed where the client can consume it
- the client actually reads it in practice

## Consequences

- research documentation becomes part of the product discipline
- `mip render <target>` should only be implemented for verified targets
- unverified platforms should be labeled clearly as experimental
- Route 1 success is measured by read-path reliability, not file generation alone