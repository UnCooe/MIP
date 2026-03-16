# Project Instructions

<!-- MIP_USER_CONTEXT:START -->
## MIP User Context Source Of Truth

Treat [MIP-CONTEXT.md](./MIP-CONTEXT.md) as a governed memory source, not as an always-injected context blob.

Use that file as the user's cross-project source of truth for stable preferences, explicit self-corrections, and user facts.

Read only the minimum relevant parts for the current task.
Do not pull unrelated personal details into the active context just because the file exists.

Consult [MIP-CONTEXT.md](./MIP-CONTEXT.md) when the task depends on:
- stable collaboration preferences
- explicit self-corrections
- already confirmed user facts
- conflict checks against inferred memory

If other user-description files conflict with [MIP-CONTEXT.md](./MIP-CONTEXT.md), prefer [MIP-CONTEXT.md](./MIP-CONTEXT.md) unless a higher-priority project rule explicitly overrides it.

Do not rewrite [MIP-CONTEXT.md](./MIP-CONTEXT.md) directly unless the user explicitly asks for it. Put inferred updates into a separate suggestion artifact first.
<!-- MIP_USER_CONTEXT:END -->
