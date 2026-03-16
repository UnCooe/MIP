# Read Policy Declaration Draft

- Status: Draft
- Scope: declaring selective consultation behavior in the memory source

## Goal

Allow the user-controlled memory source to declare which fields are always-on versus on-demand.

## Current Draft Location

```json
{
  "custom": {
    "mip_read_policy": {
      "always_on_preferences": ["response_style", "formality"],
      "always_on_custom": ["work_style", "self_corrections"]
    }
  }
}
```

## Why This Matters

If selective consultation stays only inside renderer defaults, portability is weaker than it looks.
Declaring the policy in the memory source makes it easier for multiple renderers or agents to converge on the same read behavior.

## Current Constraint

The policy still lives under `custom` for now.
That is intentional until the shape proves stable enough for a formal promoted schema field.
