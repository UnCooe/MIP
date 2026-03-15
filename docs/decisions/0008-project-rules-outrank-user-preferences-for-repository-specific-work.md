# 0008 - Project Rules Outrank User Preferences For Repository-Specific Work

- Status: Accepted
- Date: 2026-03-15

## Context

Route 1 testing showed that many real repositories already contain their own `AGENTS.md` rules. MIP must coexist with those rules without implying that user preferences can override repository-specific constraints.

## Decision

For repository-specific work, priority is:
1. safety, correctness, and hard repository constraints
2. project workflow and implementation rules
3. user collaboration preferences and user facts from `MIP-CONTEXT.md`
4. model-inferred history or unstated assumptions

`MIP-CONTEXT.md` remains the user fact source of truth, but it does not override project implementation rules by default.

## Why

This separation prevents a false assumption that user context can overrule repository constraints. A user may prefer concise answers or a certain explanation style, but those preferences should not erase project-specific requirements such as testing, security, or architecture rules.

## Consequences

- MIP tooling should avoid claiming that user context outranks project constraints
- conflict handling must distinguish user-fact conflicts from project-rule conflicts
- `check` tooling may warn when an existing `AGENTS.md` appears to contain exclusive or overlapping rule language