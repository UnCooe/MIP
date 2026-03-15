# Route 2 Governed Writeback Draft

- Status: Draft
- Scope: extension-first design, not part of core MIP v0.1

## Goal

Provide a safe path for agent-assisted memory updates without allowing unrestricted writes into the user-controlled source of truth.

## Design Principle

Not every memory candidate should be written in the same way.
The draft separates three classes:

1. `facts`
2. `observations`
3. `pending_confirmation`

## Write Classes

### Facts

Facts are objective and verifiable.
They may be written with less friction, but should still carry evidence and source metadata.

Examples:
- completed project milestone
- user explicitly stated a stable preference
- tool usage proven by project activity

### Observations

Observations are useful but inferential.
They should never overwrite stable identity or preference fields directly.

Examples:
- the user appears to prefer direct communication
- the user seems focused on infrastructure concerns

### Pending Confirmation

Pending confirmation is the buffer for high-risk or conflicting updates.
This class exists to prevent the system from turning guesses into truth.

Examples:
- long-term goals
- personality claims
- role changes inferred indirectly
- updates that conflict with an explicit user statement

## Proposed Metadata

### Shared
- `key`
- `value`
- `source`
- `updated_at`
- `notes` optional

### Facts only
- `evidence`

### Observations only
- `confidence`

### Pending confirmation only
- `reason`

## Why Extension-First

Route 2 is important, but it is still easier to get wrong than Route 1.
Keeping this model in an extension draft allows iteration without destabilizing the read path already validated in Route 1.

## Draft Assets

- [Schema draft](../../schemas/memory.writeback.extension.schema.json)
- [Example file](../../examples/memory.writeback-extension.json)