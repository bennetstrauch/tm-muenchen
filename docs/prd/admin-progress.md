# Admin: Leiter-Benachrichtigung & Magic Link — Progress

PRD: docs/prd/admin-leiter-benachrichtigung.md
Issues: docs/issues/

## Status

| # | Issue | Status |
|---|---|---|
| 8 | Placeholder-Fix: Formularfelder leeren | ✅ done |
| 9 | Magic Link: Token-Auth im Admin-Panel | ✅ done |
| 10 | Leiter-Benachrichtigung per E-Mail | ⬜ todo |

## Notes

- Implement in order: 8 → 9 → 10
- Issue 10 depends on issue 9 being live (magic links must work before emails go out)
- After each issue: run `npx tsc --noEmit`, then commit
- Mark issue ✅ done after each successful commit
- `ADMIN_TOKEN_SECRET` env var must be set in Vercel before deploying issue 9
