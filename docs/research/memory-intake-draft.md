# Memory Intake Draft

- Status: Draft
- Scope: transforming raw user-provided materials into structured MIP candidates

## Goal

Define how MIP should ingest open-ended user-provided materials and turn them into structured memory candidates without forcing the user to manually pre-structure everything.

## Intake Principle

Input sources are open-ended.
The system should not assume only a fixed list of accepted document types.

Useful examples include:

- resumes
- coding philosophies
- assistant rule files
- personal notes
- project summaries
- prior prompts or profiles

But the general rule is:

- if the user provides it as relevant material, intake should be able to process it

## Proposed Intake Stages

1. source collection
2. extraction
3. mapping
4. review

## Key Distinction

The trust question is not "what document type is this?"
The more important questions are:

- did the user provide it directly?
- is the content explicit or inferred?
- what write class should it map to?
- does any part require confirmation?

## Why This Matters

Without an intake layer, MIP still asks the user to think like a schema author.
That creates friction exactly where the product should be reducing it.
