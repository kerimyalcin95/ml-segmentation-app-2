# Commit Message Instructions

Generate commit messages using Conventional Commits.

Format:

type(scope): short description

Rules:
- Use lowercase
- Use imperative mood
- Keep subject under 72 characters
- Do not add periods at the end
- Do not write "updated", "changed", "fixed stuff"
- Describe the actual code change

Allowed types:

feat     - new functionality
fix      - bug fixes
docs     - documentation
style    - formatting only
refactor - code restructuring
perf     - performance improvements
test     - tests
build    - build system/dependencies
ci       - GitHub Actions/workflows
chore    - maintenance

Repository scopes:

frontend
electron
python
build
ci
deps
docs

Examples:

feat(frontend): add segmentation controls

fix(electron): prevent startup crash

ci(build): add windows release workflow

build(electron): configure macos packaging