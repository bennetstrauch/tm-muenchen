# Domain Docs

This repo uses a **single-context** layout — one `CONTEXT.md` and one `docs/adr/` directory at the repo root.

## Where to look

| What | Path |
|---|---|
| Domain glossary, page structure, design decisions | `CONTEXT.md` |
| Architectural decision records | `docs/adr/*.md` |
| Project goals, tech stack, roadmap | `CLAUDE.md` |

## Rules for skills reading these docs

- **Always read `CONTEXT.md` before proposing copy, terminology, or structural changes.** The canonical term for the intro session is `Infoabend` — never `Infovortrag` or `Info-Termin`.
- **Check `docs/adr/` before recommending architectural changes.** If an ADR already decided the approach, don't re-litigate it — reference the ADR instead.
- **`CLAUDE.md` owns the roadmap.** Phase status lives there; don't infer it from code alone.
- **Apply ADR 0002 to all generated code.** Professional, elegant, simple: no premature abstraction, no defensive code for impossible cases, no explanatory comments.
- When writing new ADRs, place them in `docs/adr/` with a zero-padded sequence number (e.g. `0003-my-decision.md`).
