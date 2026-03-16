# 0022 - Read Policy Can Be Declared In Memory Source

- Status: Accepted
- Date: 2026-03-16

## Context

Selective consultation is now part of the project direction, and selective rendering became the default output behavior.
However, the actual always-on versus on-demand split still lived only inside implementation constants.

## Decision

MIP read policy may now be declared in the memory source itself through `custom.mip_read_policy`.

The current draft supports:

- `always_on_preferences`
- `always_on_custom`

Implementation defaults still exist, but declared policy should override them.

## Why

This moves selective consultation one step closer to a portable rule instead of leaving it as hidden renderer behavior.

## Consequences

- the memory source can now participate in read-policy decisions
- renderers can remain opinionated by default while still respecting explicit user policy
- a future formal schema can promote read policy out of ad hoc custom space once the shape stabilizes
