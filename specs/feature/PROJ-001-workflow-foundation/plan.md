# Implementation Plan: Workflow Foundation

**Branch**: `001-workflow-foundation` | **Date**: 2026-02-14 | **Spec**: [spec.md](specs/001-workflow-foundation/spec.md)
**Input**: Feature specification from `specs/001-workflow-foundation/spec.md`

## Summary

This plan implements the foundational workflow infrastructure for DI-Lab, establishing:

- Conventional commit enforcement via commitlint
- Automated changelog & release management via **release-please-action**
- Semantic versioning via release-please-action
- Pre-commit and commit-msg hooks via Husky
- Agent instructions for commit failure recovery
- Project documentation (README, LICENSE, CHANGELOG)

The workflow foundation must be in place before any application code is developed.

## Technical Context

**Language/Version**: TypeScript 5.9.x with Bun runtime
**Primary Dependencies**:

- commitlint (@commitlint/cli, @commitlint/config-conventional)
- Husky (v9.x for git hooks)
- lint-staged (for staged file processing)
- **googleapis/release-please-action@v4** (GitHub Action for changelog & releases)
  **Storage**: N/A (configuration files only)
  **Testing**: Manual testing via git operations + automated hook validation
  **Target Platform**: Node.js/Bun development environment, GitHub repository
  **Project Type**: Single web application (Next.js 16)
  **Performance Goals**: Pre-commit hooks complete in < 30 seconds
  **Constraints**:
- Must not break existing bun typecheck/lint workflows
- Hooks must provide actionable error messages
- Release PR workflow must be reviewable before merge
  **Scale/Scope**: Single repository, multiple contributors via AI agents

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### SDD Principles Compliance

| Principle                     | Status | Notes                                                  |
| ----------------------------- | ------ | ------------------------------------------------------ |
| Spec becomes System           | PASS   | Workflow foundation defined by spec, not ad-hoc config |
| Architecture Executable       | PASS   | commitlint config enforces commit conventions          |
| Intent Over Implementation    | PASS   | Hooks enforce policy, humans define intent             |
| Parallelization & Consistency | PASS   | All contributors follow same commit format             |
| AI-Native Workflow            | PASS   | Agent instructions enable autonomous error recovery    |

### Domain Principles Compliance

| Principle               | Status | Notes                                      |
| ----------------------- | ------ | ------------------------------------------ |
| User-First Experience   | PASS   | N/A - infrastructure feature               |
| Data Integrity          | PASS   | Changelog preserves change history         |
| Security & Privacy      | PASS   | N/A - no user data involved                |
| Transparent Methodology | PASS   | Commit format and changelog are documented |
| Tiered Value            | PASS   | N/A - infrastructure feature               |

### Technical Constraints

| Constraint            | Status | Notes                            |
| --------------------- | ------ | -------------------------------- |
| Next.js 16 + React 19 | PASS   | Infrastructure independent       |
| Tailwind CSS 4        | PASS   | Infrastructure independent       |
| Drizzle ORM + SQLite  | PASS   | Infrastructure independent       |
| NextAuth 5            | PASS   | Infrastructure independent       |
| Bun Package Manager   | PASS   | Hooks use bun commands           |
| Performance Standards | PASS   | Hooks timeout at 30s per FR-017b |

**Gate Result**: PASSED - No violations requiring justification

## Project Structure

### Documentation (this feature)

```text
specs/001-workflow-foundation/
plan.md              # This file
research.md          # Phase 0 output - dependency research
data-model.md        # Phase 1 output - config schemas
quickstart.md        # Phase 1 output - developer guide
contracts/           # Phase 1 output - JSON schemas for configs
and tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
# Configuration files (root level)
commitlint.config.js     # Commit message validation
.husky/                  # Git hooks directory
pre-commit           # Runs lint + typecheck
commit-msg           # Runs commitlint
.lintstagedrc.json       # Lint-staged configuration
.github/
workflows/
release-please.yml   # Release automation (release-please-action)
README.md                # Project documentation
LICENSE                  # AGPL-3.0-or-later
CHANGELOG.md             # Change history
release-please-config.json  # release-please configuration (optional)
.release-please-manifest.json  # Version manifest

# Already created (referenced for completeness)
.github/
ISSUE_TEMPLATE/
bug_report.md
feature_request.md
task.md
pull_request_template.md
.kilocode/
rules/
commit.md        # Agent instructions
```

**Structure Decision**: Configuration-only feature. No src/ code required. All artifacts are configuration files, documentation, or GitHub Actions workflows.

## Complexity Tracking

> **No violations to justify** - Constitution check passed all gates.

---

## Phase 0: Research

### Research Tasks

| ID  | Task                                                    | Status   |
| --- | ------------------------------------------------------- | -------- |
| R1  | Research commitlint best practices for Bun projects     | Complete |
| R2  | Research Husky v9 configuration with Bun                | Complete |
| R3  | Research release-please-action for changelog & releases | Complete |
| R4  | Research semantic versioning via release-please         | Complete |
| R5  | Research lint-staged with Bun                           | Complete |

### Key Decisions

| Decision           | Choice                | Rationale                                                          |
| ------------------ | --------------------- | ------------------------------------------------------------------ |
| Changelog tool     | release-please-action | Google-supported, native conventional commits, release PR workflow |
| Version management | release-please-action | Automatic package.json version bumping                             |
| Release workflow   | Release PR            | Review before merge, safe for teams                                |

---

## Phase 1: Design & Contracts

### Data Model

See [`data-model.md`](./data-model.md) for entity definitions:

- `CommitMessage` - Validated commit message structure
- `ChangelogEntry` - Changelog entry format
- `SpecReference` - Spec-to-issue linkage

### Configuration Contracts

See [`contracts/`](./contracts/) directory for JSON schemas:

- `commitlint.schema.json` - commitlint configuration validation

### Developer Guide

See [`quickstart.md`](./quickstart.md) for:

- Installation steps
- Hook testing procedures
- Release PR workflow
- Troubleshooting common issues

---

## Implementation Phases

### Phase 2: Core Configuration (6 tasks)

| Task ID | Description                     | Priority |
| ------- | ------------------------------- | -------- |
| T001    | Install commitlint dependencies | P1       |
| T002    | Create commitlint.config.js     | P1       |
| T003    | Install and configure Husky v9  | P1       |
| T004    | Create pre-commit hook          | P1       |
| T005    | Create commit-msg hook          | P1       |
| T006    | Configure lint-staged           | P1       |

### Phase 3: GitHub Actions (4 tasks)

| Task ID | Description                          | Priority |
| ------- | ------------------------------------ | -------- |
| T007    | Create release-please.yml workflow   | P1       |
| T008    | Create release-please-config.json    | P1       |
| T009    | Create .release-please-manifest.json | P1       |
| T010    | Test release PR workflow             | P2       |

### Phase 4: Project Documentation (3 tasks)

| Task ID | Description                        | Priority |
| ------- | ---------------------------------- | -------- |
| T011    | Create README.md with badges       | P1       |
| T012    | Create LICENSE (AGPL-3.0-or-later) | P1       |
| T013    | Create CHANGELOG.md with v0.1.0    | P1       |

### Phase 5: Validation (3 tasks)

| Task ID | Description                    | Priority |
| ------- | ------------------------------ | -------- |
| T014    | Test commit message validation | P1       |
| T015    | Test pre-commit hook execution | P1       |
| T016    | Test release-please workflow   | P2       |

---

## Dependencies

### NPM Packages to Install

```json
{
  "devDependencies": {
    "@commitlint/cli": "^19.x",
    "@commitlint/config-conventional": "^19.x",
    "husky": "^9.x",
    "lint-staged": "^15.x",
    "prettier": "^3.x"
  }
}
```

### GitHub Actions (workflow dependencies)

| Action                             | Version | Purpose                        |
| ---------------------------------- | ------- | ------------------------------ |
| `googleapis/release-please-action` | v4      | Changelog & release automation |
| `actions/checkout`                 | v4      | Repository checkout            |

---

## Risks & Mitigations

| Risk                                      | Impact | Mitigation                                                |
| ----------------------------------------- | ------ | --------------------------------------------------------- |
| Hook timeout causes developer frustration | High   | Set 30s timeout per FR-017b; provide clear error messages |
| release-please creates unwanted releases  | Medium | Review Release PR before merging; delete if needed        |
| commitlint rejects valid commits          | Medium | Provide clear error messages with format examples         |
| Bun compatibility issues                  | Low    | Test all tools with Bun; use Node fallback if needed      |

---

## release-please-action Workflow

### How It Works

```
Push to main
      |
      v
release-please-action runs
      |
      v
Creates/Updates Release PR
      |
      v
[Developer reviews Release PR]
      |
      v
Merge Release PR
      |
      +---> CHANGELOG.md updated
      +---> package.json version bumped
      +---> GitHub Release created
      +---> Git tag created
```

### Release PR Content

When release-please creates a Release PR, it includes:

1. **CHANGELOG.md** - Organized by commit type (Added, Fixed, Changed, etc.)
2. **package.json** - Version bump based on commit types
3. **Release notes** - Summary of changes for GitHub release

### Example Release PR

```markdown
## 0.2.0 (2026-02-15)

### Added

- feat: add gem selector component (#42)
- feat: implement greedy optimization algorithm (#44)

### Fixed

- fix: resolve resonance calculation error (#43)

### Changed

- refactor: simplify auth flow (#45)
```

---

## Success Criteria

| ID     | Criterion                                    | Validation Method         |
| ------ | -------------------------------------------- | ------------------------- |
| SC-001 | 100% of commits follow conventional format   | commitlint enforcement    |
| SC-002 | CHANGELOG.md updates on Release PR merge     | release-please-action log |
| SC-003 | Hooks complete within 30 seconds             | Manual timing             |
| SC-004 | Agent can autonomously recover from failures | Agent instruction test    |
| SC-005 | All documentation files present              | File existence check      |
| SC-006 | Release PR workflow creates GitHub releases  | Manual test on main       |

---

**Version**: 2.0.0 | **Last Updated**: 2026-02-14
