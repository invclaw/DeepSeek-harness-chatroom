# DeepSeek Harness Chatroom Agent Contract

This repository is the source of truth for the public Chatroom plugin. Keep the
plugin out-of-tree from DeepSeek Harness and preserve the native Session, model,
permission, trajectory, and composer surfaces.

## Before editing

1. Read [`README.md`](README.md), [`README.zh.md`](README.zh.md), and
   [`docs/ioa-deployment.md`](docs/ioa-deployment.md) when a change affects
   operator-visible behavior, authentication, or deployment integration.
2. Check the current branch, `git status --short`, and `git worktree list`.
   Preserve unrelated work and stay on the current branch. Do not use force push,
   stash, reset, or cleanup commands to hide another contributor's changes.
3. Treat the installed DeepSeek Harness checkout as compatibility evidence only;
   confirm extension points from the pinned dependency rather than guessing them.

## Route changes to their source of truth

- `src/` is the implementation source. Keep tracked `dist/` output and package
  metadata synchronized whenever a published bundle changes.
- Client or layout behavior belongs with an observable unit or browser assertion
  under `tests/`; prefer computed styles, geometry, and visible behavior over
  screenshot snapshots.
- Authentication and IOA behavior must preserve the contracts in
  `docs/ioa-deployment.md` and must not put credentials, cookies, or tokens in
  source, fixtures, screenshots, or logs.
- Operator-facing behavior changes update `README.md` and `README.zh.md`
  together. Keep deployment version pins in the downstream dsh-demo
  `versions.env` rather than copying them into this repository.
- A package version change adds a concise entry to both README release histories;
  do not create a second changelog or duplicate the deployment runbook.

## Verification

- For source, package, or behavior changes, run `pnpm run check:ci`. This runs
  type checks, tests, the production build, and the Chromium browser suite.
- For documentation-only changes, check every changed relative link and run
  `git diff --check`; run the full suite when package metadata or generated output
  is touched.
- Before opening a PR, inspect the packaged file list with `pnpm pack --dry-run`
  when the published surface changed. A failed check is a blocking result, not a
  reason to weaken the assertion.

## Review and land

Open a pull request against `main`, keep the branch's scope explicit, and wait for
the repository CI workflow and review to finish before merging. Do not rewrite
published history. If a change is consumed by dsh-demo, land this repository first,
then update the downstream pin and run its deployment verification; the two
repositories retain independent release histories.
