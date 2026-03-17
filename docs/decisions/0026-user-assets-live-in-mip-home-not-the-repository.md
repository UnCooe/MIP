# 0026: User Assets Live In `~/.mip/`, Not The Repository

- Status: Accepted
- Date: 2026-03-16

## Context

The repository currently serves three roles at once:

- protocol and schema documentation
- tooling and reference scripts
- temporary storage for user-specific artifacts during development

That overlap was useful for prototyping, but it creates a portability problem.
If intake drafts, suggestions, approvals, and candidate memory files live inside the repository, users may incorrectly treat the repository as the memory home itself.

That creates several risks:

- migrating user memory now appears to require migrating the entire repository
- project-local generated files can be confused with portable source-of-truth assets
- absolute local file paths leak into artifacts that users may expect to be portable

## Decision

MIP now treats `~/.mip/` as the default user asset home.

The repository is for:

- specs
- docs
- schemas
- scripts

The user asset home is for:

- `memory.json`
- `intake/`
- `suggestions/`
- `plans/`
- `approvals/`
- `resolutions/`

Project directories are only for generated projections such as:

- `AGENTS.md`
- `MIP-CONTEXT.md`

## Consequences

- cross-machine or cross-platform migration should move `~/.mip/`, not the repository
- generated project files are treated as projections, not as durable user assets
- tooling defaults should point to `~/.mip/` for governed memory artifacts
- repository-local artifact paths used during early prototyping should not be treated as the long-term model

## Follow-up

This decision does not yet solve portable provenance.
Local source paths may still appear in drafts and review outputs.
That should be handled separately through export-friendly source labels or digests rather than by keeping user assets inside the repository.
