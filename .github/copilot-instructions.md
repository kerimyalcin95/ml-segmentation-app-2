# Git Commit Guidelines

## Commit message format

Use Conventional Commits.

Format:

<type>(<scope>): <short description>

Examples:

feat(ui): add image segmentation preview panel
fix(build): fix electron-builder artifact naming
docs(readme): update installation instructions
refactor(core): simplify segmentation pipeline
chore(deps): update npm dependencies

## Allowed types

Use only:

- feat: new feature
- fix: bug fix
- docs: documentation changes
- style: formatting only, no logic changes
- refactor: code restructuring without behavior changes
- perf: performance improvements
- test: adding or modifying tests
- build: build system or dependency changes
- ci: GitHub Actions or CI changes
- chore: maintenance tasks

## Scope rules

Use a scope when possible.

Common scopes:

- frontend: Svelte frontend changes
- backend: Node.js backend changes
- electron: Electron main process changes
- python: Python integration changes
- build: electron-builder/package configuration
- ci: GitHub Actions workflows
- deps: dependency updates
- docs: documentation

Examples:

feat(frontend): add segmentation controls
fix(electron): prevent window crash on startup
ci(actions): add macOS build workflow

## Description rules

- Use lowercase.
- Do not end with a period.
- Keep the first line under 72 characters.
- Describe what changed, not why it was done.
- Use imperative style.