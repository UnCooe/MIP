# 0025 - Intake Review Comes Before Build Memory

- Status: Accepted
- Date: 2026-03-16

## Context

Guided intake now has a draft stage and a build stage.
Without an explicit review surface, the user still has to inspect raw JSON by hand or trust the extraction blindly.

## Decision

Guided intake should provide a dedicated review step before building the initial memory candidate.

## Why

This keeps initialization aligned with the rest of the project:
drafts should be reviewable before they become stronger artifacts.

## Consequences

- guided intake becomes `draft intake -> review intake -> build memory`
- initialization becomes easier to demo and easier to validate
- future richer extraction logic will have a stable review surface to target
