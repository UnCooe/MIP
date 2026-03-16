# 0020 - MIP Must Be Consulted Selectively, Not Always Injected

- Status: Accepted
- Date: 2026-03-16

## Context

MIP now has both a read path and a growing governed writeback model.
That creates a new risk: treating the full user memory surface as something that should always be injected into every task.

This would recreate the same failure mode seen in many memory systems:

- irrelevant personal details pollute task context
- models overfit weakly relevant user information
- memory becomes a prompt dump instead of a governed source

## Decision

MIP should be treated as a governed memory source that agents consult selectively.
It should not be treated as an always-injected context blob.

## Why

Not every task needs user memory.
Even when memory is relevant, only a subset is usually needed.

The goal is not "more context by default".
The goal is "relevant user-controlled context when the task actually depends on it".

## Consequences

- project entry instructions should emphasize selective consultation
- future renderers should distinguish between always-on rules and on-demand memory
- MIP evaluation should care about retrieval discipline, not only successful injection
