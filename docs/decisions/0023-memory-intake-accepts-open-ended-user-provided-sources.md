# 0023 - Memory Intake Accepts Open-Ended User-Provided Sources

- Status: Accepted
- Date: 2026-03-16

## Context

MIP now has:

- stable read-path validation
- selective consultation and selective rendering
- a governed writeback preflight chain

The next missing capability is not deeper apply logic.
It is the intake step between raw user-provided material and structured MIP memory.

There is also a framing risk here:
if intake is defined around a narrow list such as resumes, user rules, or project summaries, the product will incorrectly suggest that only those source types are valid.

## Decision

Memory intake should accept open-ended user-provided sources.

Examples like resumes, coding philosophy, assistant rules, personal notes, or project summaries are useful, but they are only examples.
The governing principle is:

- if the user believes a source is useful for structuring their MIP memory, the system may accept it as intake input

## Why

This keeps the system aligned with the product goal of reducing user cognitive load.
Users should not have to first classify their material into a product-approved document type before the system can help structure it.

## Consequences

- future intake rules should classify extracted content, not reject inputs because they come from an unexpected document type
- source trust and write class still matter, but source type itself should not become an artificial gate
- user-provided materials remain high-trust inputs, while model inferences derived from them still require governed handling
