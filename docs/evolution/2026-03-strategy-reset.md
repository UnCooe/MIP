# 2026-03 Strategy Reset

## Summary

MIP started from a broad intuition about portable AI memory.
After several rounds of critique, the project tightened its scope.

The main insight was that not every remembered fact about a user is equally valuable.
In many real development scenarios, broad identity information is low-value context, while stable collaboration preferences and explicit corrections are high-value context.

## What Changed

### Before
The project language leaned toward general user memory and identity portability.

### After
The project now distinguishes between:
- low-value identity framing
- high-value collaboration memory
- future governed writeback capabilities

This reset did not kill the project idea.
It clarified where near-term value actually exists.

## Why The Reset Happened

Several tensions surfaced:
- MIP risked collapsing into a glorified global user rules file
- not every tool has the same stable entry point for reading user context
- automatic writeback looked attractive but was too risky without governance

Instead of pretending those tensions were resolved, the project accepted them and adjusted direction.

## Current Direction

- prove route 1 first: portable, user-controlled context that real tools can consume
- keep route 2 alive: governed writeback, observation/fact separation, and conflict handling
- document decisions publicly instead of hiding the reasoning in chat history alone

## Implication

MIP should evolve as a staged system:
- small enough to adopt
- explicit enough to trust
- extensible enough to govern later writes