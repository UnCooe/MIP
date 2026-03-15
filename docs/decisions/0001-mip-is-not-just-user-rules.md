# 0001 - MIP Is Not Just User Rules

- Status: Accepted
- Date: 2026-03-15

## Context

MIP repeatedly drifted toward looking like a portable global user rules file.
This raised a legitimate challenge: if the project only stores explicit user instructions and preferences, why not call it user rules and stop there?

## Decision

MIP remains useful only if it is framed as more than a style-preferences container.

The project will define MIP as a portable, user-controlled memory source with governance rules.

That means MIP must support at least these distinctions over time:
- user-declared stable preferences
- explicit corrections
- verifiable facts
- inferred observations that do not automatically overwrite the source of truth
- controlled write paths instead of unrestricted edits

## Why

User rules and MIP overlap, but they are not the same problem.

User rules mainly solve how an AI should behave.
MIP is meant to solve how user-controlled context can be shared, corrected, and eventually updated across tools without being trapped inside a single vendor product.

If MIP never moves beyond static preference declaration, its differentiation becomes weak.
That risk is acknowledged and should continue to shape scope decisions.

## Consequences

- In the short term, MIP may look close to portable user rules.
- In the long term, the project must add memory governance concepts if it wants to remain meaningfully distinct.
- Public messaging should avoid overselling current capabilities.