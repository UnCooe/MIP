# Selective Memory Consultation Draft

- Status: Draft
- Scope: when and how agents should consult MIP without over-injecting user memory

## Goal

Define a practical read policy that avoids turning MIP into a large always-on prompt.

## Core Principle

MIP should be available, but not always fully injected.
Agents should consult it selectively based on task relevance.

## Current Draft Heuristic

Always-on candidates:

- explicit self-corrections with high risk if ignored
- stable collaboration preferences
- hard user-declared constraints

Consult on demand:

- confirmed user facts
- longer-term work history
- profile details
- prior observations

Default to not loading:

- unrelated personal details
- broad identity/profile content that does not affect the current task
- stale or weakly related memory entries

## Why This Matters

This keeps MIP aligned with its real value:

- relevant memory when needed
- user control over the source
- lower context pollution

Without this discipline, MIP would drift toward a generic prompt stuffing mechanism.
