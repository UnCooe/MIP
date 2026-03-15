# 0006 - Experimental Targets Must Be Labeled Explicitly

- Status: Accepted
- Date: 2026-03-15

## Context

Some targets can be observed to work in practice before the project has clean primary-source documentation for their entry points. Antigravity currently falls into that category: local testing indicates it reads project-local context, but the official stable rule or memory path was not fully confirmed in this review.

## Decision

MIP may support experimental targets, but they must be labeled explicitly as experimental until both of these are true:
- the project has a reproducible local validation path
- the entry point is documented by a clean primary source or validated repeatedly enough to act as a practical contract

## Why

Without this distinction, the project will overstate support quality and confuse experimentation with stable compatibility.

A target being usable is not the same as its integration contract being well understood.

## Consequences

- Route 1 may include experimental adapters
- README and research docs should distinguish verified targets from experimental ones
- Antigravity can be explored next, but with weaker support claims than Codex