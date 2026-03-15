# 0009 - Route 2 Starts As An Extension Draft

- Status: Accepted
- Date: 2026-03-15

## Context

Route 2 introduces governed writeback, which is materially riskier than Route 1. The project now has validated read paths, but does not yet have enough field semantics or user-consent handling to safely commit writeback behavior into the core MIP spec.

## Decision

Route 2 will begin as an extension draft rather than a core-schema change.

The first draft defines three write classes:
- `facts`
- `observations`
- `pending_confirmation`

## Why

This preserves the small, adoptable nature of core MIP while still creating a concrete place to iterate on governed writeback.

The extension-first approach also matches the current maturity level:
- Route 1 has real integration evidence
- Route 2 has strong design pressure, but not enough protocol stability yet

## Consequences

- governed writeback can evolve without breaking the current core read format
- draft schemas and examples can be published early for discussion
- the project can compare extension usage before deciding what should graduate into the core spec