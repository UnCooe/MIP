# 0021 - Selective Rendering Is The Default Context Output

- Status: Accepted
- Date: 2026-03-16

## Context

MIP already established that agents should consult memory selectively.
However, the generated `MIP-CONTEXT.md` still rendered the full memory surface in one flat document.

That made the default output easy to overuse as a large injected context blob.

## Decision

The default `build-context` output will now be selective.

It should render:

- always-on guidance for stable collaboration preferences and explicit self-corrections
- on-demand sections for everything else

Full rendering remains available as an explicit mode.

## Why

This aligns the generated artifact with the project's consultation model.
If the default output remains flat and full, the project will keep encouraging the wrong usage pattern even while the documentation says otherwise.

## Consequences

- `MIP-CONTEXT.md` now becomes more disciplined by default
- agents can still consult deeper sections when relevant
- full rendering remains possible when a workflow explicitly needs it
