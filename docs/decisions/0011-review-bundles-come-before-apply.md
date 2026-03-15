# 0011 - Review Bundles Come Before Apply

- Status: Accepted
- Date: 2026-03-15

## Context

Once Route 2 can generate multiple suggestion files, manual review becomes fragmented. Jumping directly from multiple loose suggestions to an apply command would skip the review stage that governed writeback needs.

## Decision

Route 2 will add a bundle step before any future apply step.

The initial command is `mip pack suggestions`, which converts loose suggestion files into a single review artifact.

## Why

This preserves human review as a first-class part of the workflow and gives the project a stable intermediate object for later approval semantics.

## Consequences

- suggestion generation is no longer the end of the Route 2 workflow
- future apply logic can target bundles instead of ad hoc directory scans
- review artifacts can be shared or archived without mutating source memory