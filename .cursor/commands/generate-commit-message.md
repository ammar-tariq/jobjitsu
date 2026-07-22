# Generate commit message

Read staged changes (`git diff --cached`; if empty, `git diff` + status). Draft a Commitlint-valid Conventional Commit for this repo.

Follow `.cursor/rules/commit-messages.mdc` and root `.cursorrules` exactly.

Output **only** the commit message (no fences, no commentary), ready to paste into Source Control.
