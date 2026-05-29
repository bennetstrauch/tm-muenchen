# Triage Labels

The five canonical triage roles use their default label strings.

| Role | Label | Meaning |
|---|---|---|
| Needs evaluation | `needs-triage` | Maintainer hasn't assessed this yet — default for new issues |
| Waiting on reporter | `needs-info` | Issue is unclear; blocked on more information from the person who filed it |
| Ready for agent | `ready-for-agent` | Fully specified; an AFK autonomous agent can implement this with no human in the loop — see DoD below |
| Ready for human | `ready-for-human` | Clear enough to implement but requires human judgment or creativity |
| Won't fix | `wontfix` | Will not be actioned; close with a reason |

## Definition of done: `ready-for-agent`

An issue may only receive this label if **all** of the following are present in the issue body:

- **Goal** — one sentence: what should be true when this is done?
- **Constraints** — what must not change, break, or be introduced?
- **Acceptance criteria** — a checklist an agent can verify mechanically (no subjective items)
- **Affected area** — which files, components, or routes are in scope?
- **Out-of-scope** — what explicitly is not part of this issue?
- **UX expectations** — required if the issue touches any UI; describe the expected behaviour at mobile (390px) and desktop
- **Test expectations** — is a test required? If so, what kind?

If any item is missing or vague, label it `needs-info` instead and post a comment listing what's missing.

## State machine

```
new issue → needs-triage → needs-info (→ needs-triage when info arrives)
                         → ready-for-agent
                         → ready-for-human
                         → wontfix
```

## Creating labels in GitHub

If the labels don't exist yet in the repo, create them:

```bash
gh label create "needs-triage" --color "e4e669" --description "Awaiting maintainer evaluation"
gh label create "needs-info" --color "d876e3" --description "Waiting on reporter for more information"
gh label create "ready-for-agent" --color "0075ca" --description "Fully specified — safe for autonomous agent"
gh label create "ready-for-human" --color "008672" --description "Needs human implementation"
gh label create "wontfix" --color "ffffff" --description "Will not be actioned"
```
