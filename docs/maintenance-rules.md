# MIP Maintenance Rules

This document records the current working rules for maintaining user memory outside the core MIP v0.1 spec.

## Goals

- Keep one editable source of truth under user control.
- Let AI tools reuse that memory across projects.
- Avoid turning low-confidence inferences into permanent identity claims.

## Memory Layers

Use three writeback classes instead of treating every update the same:

1. Facts
2. Observations
3. Pending confirmation

### Facts

Facts may be written without an extra confirmation step only when they are objective and verifiable.

Examples:

- completed tasks
- produced documents
- tools or technologies explicitly used
- preferences the user stated in a direct and unambiguous way

### Observations

Observations are model inferences and must not overwrite stable identity or preference fields directly.

Examples:

- communication style appears direct
- user may prefer product framing
- recent focus appears to be protocol design

Recommended metadata:

- `value`
- `confidence`
- `source`
- `last_seen`

### Pending Confirmation

Anything high-risk, identity-shaping, or conflicting with existing memory belongs here first.

Examples:

- profession or organization labels
- personality conclusions
- long-term goals
- worldview or relationship claims
- updates that overwrite an existing memory entry

## Writeback Policy

- Direct writeback is allowed only for verifiable facts.
- Inferred summaries should land in an observation layer or a suggestion artifact.
- Conflicts must trigger confirmation before changing the source of truth.
- User-edited memory outranks inferred memory.

## Local Workflow

Recommended near-term flow:

1. User edits `~/.mip/memory.json`.
2. A local script generates a project-readable `MIP-CONTEXT.md`.
3. Project-aware tools read that file through `AGENTS.md` or similar repo instructions.
4. AI-generated updates go into a suggestion file before they are merged into the source of truth.
