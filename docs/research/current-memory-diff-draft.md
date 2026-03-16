# Current Memory Diff Draft

- Status: Draft
- Scope: preflight comparison between eligible suggestions and the current memory source

## Goal

Extend `plan apply` so it can tell whether an eligible suggestion is actually ready to apply, already present, or in conflict with current user-controlled memory.

## Current Draft States

- `apply_ready`
- `no_op`
- `conflict`
- `memory_unavailable`

## Current Interpretation

- `apply_ready`: no current value exists at the target path under the configured merge strategy
- `no_op`: current memory already matches the suggestion
- `conflict`: current memory already holds a different value at the target path
- `memory_unavailable`: the memory source could not be loaded, so readiness cannot be assessed

## Why This Matters

Policy eligibility alone is not enough.
The system also needs to know whether a candidate would be a real change or an unsafe overwrite.
