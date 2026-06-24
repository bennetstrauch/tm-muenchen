# ADR 0002 — Coding Standards: Professional, Elegant, Simple

## Status
Accepted

## Context

This is a solo-maintained project where Claude is the primary coding assistant. Without explicit standards, AI-assisted code tends toward over-engineering: premature abstractions, defensive fallbacks for impossible cases, and comments that restate what the code already says. The result is noise that obscures intent and makes the codebase harder to navigate.

## Decision

Code in this project must be **professional, elegant, and simple**. Concretely:

### No premature abstraction
Three similar lines of code is better than a helper introduced too early. Extract only when a third real call site exists, not in anticipation of one.

### No defensive code for impossible cases
Trust Next.js, React, TypeScript, and internal module guarantees. Only validate at true system boundaries — user input and external API responses. No fallback values, null checks, or error handlers for scenarios the type system or framework already prevents.

### Never bypass established abstractions
If a helper already exists for a task (`getCurrentTenant()`, `checkAdminRequest()`, etc.), use it — do not re-implement it inline, even partially. If bypassing is genuinely necessary (e.g. a proven framework bug), the bypass must be in the helper itself, not at the call site. A call site that re-implements what a helper already does is always a bug.

### No explanatory comments
Well-named identifiers explain what the code does. Comments are only justified when the **why** is non-obvious: a hidden constraint, a framework quirk, a workaround for a specific bug. If removing the comment wouldn't confuse a future reader, don't write it. Never write multi-line comment blocks or docstrings.

### No half-finished work
No `// TODO`, `// FIXME`, placeholder implementations, or dead code left in place. Finish the thing or don't add it.

## Consequences

- Skills and agents must apply these rules when generating or reviewing code.
- Code review findings that violate these standards are valid bugs, not style preferences.
- ADR 0001 already embodies this principle: a custom consent banner was chosen over a CMP library specifically to avoid complexity that would break the design.
