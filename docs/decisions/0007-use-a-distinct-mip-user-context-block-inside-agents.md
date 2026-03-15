# 0007 - Use A Distinct MIP User Context Block Inside AGENTS.md

- Status: Accepted
- Date: 2026-03-15

## Context

The project previously inserted a generic `MIP:START/END` block into `AGENTS.md`.
That worked mechanically, but the marker name was easy to overlook and did not clearly signal that the block was the routing layer for a user context source of truth.

## Decision

MIP will use a more explicit marker pair and heading inside `AGENTS.md`:
- `<!-- MIP_USER_CONTEXT:START -->`
- `<!-- MIP_USER_CONTEXT:END -->`
- heading: `MIP User Context Source Of Truth`

Legacy `MIP:START/END` blocks remain migration targets and should be upgraded automatically when touched by the current tooling.

## Why

The file name `AGENTS.md` should remain unchanged because it is part of the validated tool entry path.

The stronger naming should happen inside the file, where it can:
- draw attention from both humans and agents
- make the protocol block easier to recognize
- reduce ambiguity with other project instructions
- support safe scripted updates

## Consequences

- existing projects with legacy markers should migrate forward automatically
- file-level compatibility remains stable because `AGENTS.md` is unchanged
- future targets that reuse the same project-local pattern should use the same explicit block naming