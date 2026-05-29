# Issue Tracker

Issues for this project live in **GitHub Issues** at `github.com/bennetstrauch/tm-muenchen`.

## CLI

Use the `gh` CLI for all issue operations.

```bash
# Create an issue
gh issue create --title "Title" --body "Body" --label "needs-triage"

# List open issues
gh issue list

# View an issue
gh issue view <number>

# Close an issue
gh issue close <number>

# Add a label
gh issue edit <number> --add-label "ready-for-agent"

# Remove a label
gh issue edit <number> --remove-label "needs-triage"

# Post a comment
gh issue comment <number> --body "Comment text"
```

## Conventions

- Every new issue should be created with the `needs-triage` label so the `triage` skill can pick it up.
- `docs/issues/*.md` files in this repo are historical planning artifacts from `/to-issues` runs — they are not the live tracker. GitHub Issues is the canonical source of truth.
- Link PRs to issues using `Closes #<number>` in the PR body.
