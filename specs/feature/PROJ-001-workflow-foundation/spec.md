# Feature Specification: Workflow Foundation

**Feature Branch**: `feature/001-workflow-foundation`  
**Created**: 2026-02-13  
**Status**: Draft  
**Input**: Meta-workflow infrastructure that must exist before any application code

## Summary

This specification defines the foundational workflow infrastructure for Glaucus App, establishing GitHub-centric spec hierarchy, conventional commits, changelog management, semantic versioning, and agent instructions for automated workflows.

## Architecture Overview

### GitHub-Centric Spec Hierarchy

The workflow foundation establishes a bidirectional sync between specification documents and GitHub Issues:

```
GitHub Issue Hierarchy:
├── Parent Issue = PRD/Spec (contains spec.md content)
│   ├── Comment: spec.md content (initial)
│   ├── Comment: plan.md content (added after /speckit.plan)
│   └── Child Issues = Tasks (individual implementation items)
│       └── Task frontmatter stores issue URL
│       └── Issue closure updates task checkbox
```

**Important**: The `plan.md` content should be added as a comment to the Parent GitHub Issue, but not necessarily as the first comment. The spec.md content is the initial issue body, and plan.md is added as a follow-up comment after the planning phase.

### Spec Cycle Directory Structure

```text
.specify/
├── memory/
│   └── constitution.md        # Foundational principles
├── scripts/
│   └── bash/                  # Automation scripts
└── templates/                 # Document templates

specs/
├── 001-workflow-foundation/
│   ├── spec.md              # Master specification
│   ├── plan.md              # Implementation phases
│   ├── tasks.md             # Syncs to child issues
│   ├── research.md          # Decisions/research
│   ├── data-model.md        # Data structures
│   ├── quickstart.md        # Developer guide
│   └── contracts/           # API/type contracts
├── 002-gem-optimizer/
│   └── ...
└── README.md
```

### Branch Naming Convention

| Type       | Pattern                             | Example                          |
| ---------- | ----------------------------------- | -------------------------------- |
| Feature    | `feature/<identifier>-<###>-<name>` | `feature/PROJ-001-gem-optimizer` |
| Fix        | `fix/<identifier>-<###>-<name>`     | `fix/PROJ-001-login-error`       |
| Identifier | Optional Linear/task tracker ID     | `PROJ`, `DI`                     |

Mapping: `specs/001-gem-optimizer/` → `feature/<id>-001-gem-optimizer`

---

## Clarifications

### Session 2026-02-14

- Q: For the README.md badges, which set of badges should be included? → A: Full set: Build Status, License (AGPL-2.0), Version, TypeScript, Next.js
- Q: For the CHANGELOG.md initial version, what should the starting version be? → A: 0.1.0 (Initial development, standard SemVer)
- Q: For the README.md content sections, which structure should be used? → A: Full: Badges, Description, Features, Quick Start, Installation, Usage, Contributing, License
- Q: For the LICENSE file, which AGPL version should be used? → A: AGPL-3.0-or-later (Allows future versions)
- Q: How should the changelog automation be triggered? → A: GitHub Actions workflow triggered on PR merge (push to main)
- Q: What should happen if a hook exceeds execution timeout? → A: Fail with timeout error (commit blocked, developer notified)
- Q: What is the maximum acceptable execution time for pre-commit hooks? → A: 30 seconds
- Q: Should the README.md include badges for workflow tools (SemVer, Conventional Commits, Keep a Changelog, Husky, commitlint)? → A: Yes, include all workflow tool badges in addition to existing badges

---

## User Stories & Testing

### User Story 1 - Conventional Commits (Priority: P1)

As a developer, I want my commit messages automatically validated against conventional commit standards so that our git history remains consistent and parseable.

**Why this priority**: Commit message consistency is foundational to automated changelog generation and semantic versioning.

**Independent Test**: Create a commit with invalid message format, verify commitlint rejects it.

**Acceptance Scenarios**:

1. **Given** commitlint is configured, **When** I commit with message "update stuff", **Then** the commit is rejected with format guidance
2. **Given** commitlint is configured, **When** I commit with message "feat: add gem selector", **Then** the commit is accepted
3. **Given** commitlint is configured, **When** I commit with message "feat(optimize): add greedy algorithm", **Then** the commit is accepted with scope

---

### User Story 2 - Changelog Management (Priority: P1)

As a developer, I want the CHANGELOG.md automatically updated when PRs merge so that release notes are always current.

**Why this priority**: Changelog accuracy is essential for release management and user communication.

**Independent Test**: Merge a PR with type "feat", verify CHANGELOG.md contains the entry under "Added" section.

**Acceptance Scenarios**:

1. **Given** CHANGELOG.md exists, **When** a "feat" PR merges, **Then** entry appears under "Added" section
2. **Given** CHANGELOG.md exists, **When** a "fix" PR merges, **Then** entry appears under "Fixed" section
3. **Given** CHANGELOG.md exists, **When** a "deprecate" PR merges, **Then** entry appears under "Deprecated" section

---

### User Story 3 - Semantic Versioning (Priority: P2)

As a release manager, I want version numbers automatically determined by commit types so that releases follow semantic versioning without manual calculation.

**Why this priority**: Automated versioning reduces human error in release management.

**Independent Test**: Create commits with types feat, fix, and breaking change, verify correct version bump.

**Acceptance Scenarios**:

1. **Given** current version is 1.0.0, **When** commits include "feat:", **Then** next version is 1.1.0
2. **Given** current version is 1.0.0, **When** commits include only "fix:", **Then** next version is 1.0.1
3. **Given** current version is 1.0.0, **When** commits include "BREAKING CHANGE:", **Then** next version is 2.0.0

---

### User Story 4 - Husky Hooks (Priority: P1)

As a developer, I want pre-commit and commit-msg hooks that validate code quality and commit format so that invalid code or commits never reach the repository.

**Why this priority**: Hooks are the enforcement mechanism for all workflow standards.

**Independent Test**: Attempt to commit with linting errors, verify pre-commit hook blocks the commit.

**Acceptance Scenarios**:

1. **Given** pre-commit hook is configured, **When** I commit code with linting errors, **Then** the commit is blocked with lint error details
2. **Given** pre-commit hook is configured, **When** I commit code that passes lint, **Then** the commit proceeds to commit-msg hook
3. **Given** commit-msg hook is configured, **When** I commit with invalid message format, **Then** the commit is blocked with format guidance

---

### User Story 5 - Agent Instructions (Priority: P2)

As an AI agent, I want clear instructions for handling commit failures so that I can autonomously resolve common issues without user intervention.

**Why this priority**: Agent autonomy requires documented failure modes and recovery strategies.

**Independent Test**: Trigger a commitlint failure, verify agent follows documented retry strategy.

**Acceptance Scenarios**:

1. **Given** agent commits with invalid format, **When** commitlint rejects, **Then** agent reformats with correct type prefix
2. **Given** agent commits with lint errors, **When** pre-commit fails, **Then** agent runs lint --fix and retries
3. **Given** merge conflict exists, **When** agent detects conflict markers, **Then** agent follows resolution protocol

---

### User Story 6 - Issue Templates (Priority: P1)

As a project manager, I want standardized issue templates that produce Spec Kit parseable format so that issues integrate with the spec workflow.

**Why this priority**: Issue templates ensure consistent data structure for spec-task sync.

**Independent Test**: Create an issue using task template, verify frontmatter is parseable.

**Acceptance Scenarios**:

1. **Given** bug_report.md template, **When** user submits issue, **Then** issue contains reproduction steps, expected behavior, spec reference
2. **Given** feature_request.md template, **When** user submits issue, **Then** issue contains user story, acceptance criteria
3. **Given** task.md template, **When** user submits issue, **Then** issue contains frontmatter with spec reference, task ID

---

### User Story 7 - PR Template (Priority: P1)

As a reviewer, I want PRs to include a checklist referencing specs and changelog so that I can verify workflow compliance.

**Why this priority**: PR templates enforce spec-workflow integration at review time.

**Independent Test**: Create a PR, verify template includes spec reference checklist.

**Acceptance Scenarios**:

1. **Given** PR template exists, **When** user creates PR, **Then** template includes spec directory reference field
2. **Given** PR template exists, **When** user creates PR, **Then** template includes changelog entry verification checkbox
3. **Given** PR template exists, **When** user creates PR, **Then** template includes spec-task sync status checkbox

---

### User Story 8 - README.md (Priority: P1)

As a new visitor, I want a comprehensive README.md with project description and badges so that I can quickly understand the project's purpose and status.

**Why this priority**: README.md is the entry point for all visitors and potential contributors, essential for project visibility and adoption.

**Independent Test**: View README.md on GitHub, verify badges render correctly and content matches memory bank documentation.

**Acceptance Scenarios**:

1. **Given** README.md exists, **When** visitor views it on GitHub, **Then** badges display: Build Status, License (AGPL-3.0-or-later), Version, TypeScript, Next.js, SemVer, Conventional Commits, Keep a Changelog, Husky, commitlint
2. **Given** README.md exists, **When** visitor reads the description, **Then** content accurately reflects the project purpose from memory bank brief.md
3. **Given** README.md exists, **When** visitor reviews sections, **Then** all required sections are present: Badges, Description, Features, Quick Start, Installation, Usage, Contributing, License

---

### User Story 9 - LICENSE (Priority: P1)

As a potential contributor, I want a clear LICENSE file so that I understand my rights and obligations when using or contributing to the project.

**Why this priority**: Legal clarity is essential for open-source projects to encourage adoption and contributions.

**Independent Test**: View LICENSE file, verify it contains AGPL-3.0-or-later license text.

**Acceptance Scenarios**:

1. **Given** LICENSE file exists, **When** visitor views it, **Then** it contains the full AGPL-3.0-or-later license text
2. **Given** LICENSE file exists, **When** automated license check runs, **Then** license is correctly identified as AGPL-3.0-or-later
3. **Given** LICENSE file exists, **When** contributor forks the repository, **Then** license terms are clear and enforceable

---

### User Story 10 - CHANGELOG.md (Priority: P1)

As a user or developer, I want an initial CHANGELOG.md with version 0.1.0 so that there's a baseline for tracking future changes.

**Why this priority**: CHANGELOG.md provides a historical record that supports the automated changelog workflow defined in User Story 2.

**Independent Test**: View CHANGELOG.md, verify it follows Keep a Changelog format with initial version 0.1.0.

**Acceptance Scenarios**:

1. **Given** CHANGELOG.md exists, **When** visitor views it, **Then** it follows Keep a Changelog format
2. **Given** CHANGELOG.md exists, **When** visitor checks the version, **Then** initial version is 0.1.0 (SemVer initial development)
3. **Given** CHANGELOG.md exists, **When** automated changelog workflow runs, **Then** new entries are appended correctly

---

## Requirements

### Functional Requirements

#### Conventional Commits (commitlint)

- **FR-001**: System MUST enforce conventional commit format: `type(scope): description`
- **FR-002**: System MUST support types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`
- **FR-003**: System MUST allow optional scope matching spec directory names
- **FR-004**: System MUST require description to start with lowercase
- **FR-005**: System MUST reject commits with descriptions longer than 72 characters

#### Changelog Management

- **FR-006**: System MUST maintain CHANGELOG.md with sections: Added, Changed, Deprecated, Removed, Fixed, Security
- **FR-006a**: System MUST use GitHub Actions workflow triggered on PR merge (push to main) for automated changelog updates
- **FR-007**: System MUST map commit types to changelog sections:
  - `feat` → Added
  - `fix` → Fixed
  - `deprecate` → Deprecated
  - `remove` → Removed
  - `security` → Security
  - `refactor`, `perf` → Changed
- **FR-008**: System MUST include PR link in changelog entries
- **FR-009**: System MUST maintain entries in reverse chronological order

#### Semantic Versioning

- **FR-010**: System MUST bump MAJOR version for BREAKING CHANGE commits
- **FR-011**: System MUST bump MINOR version for `feat:` commits
- **FR-012**: System MUST bump PATCH version for `fix:` commits
- **FR-013**: System MUST preserve pre-release identifiers (e.g., `-alpha.1`)

#### Husky Hooks

- **FR-014**: System MUST run `bun lint` in pre-commit hook
- **FR-015**: System MUST run `bun typecheck` in pre-commit hook
- **FR-016**: System MUST run commitlint in commit-msg hook
- **FR-017**: System MUST block commits on hook failure with actionable error message
- **FR-017a**: System MUST fail with timeout error if hook exceeds 60 seconds, blocking commit and notifying developer
- **FR-017b**: System MUST complete pre-commit hooks (lint + typecheck) within 30 seconds under normal conditions

#### Agent Instructions

- **FR-018**: System MUST provide `.kilocode/rules/commit.md` with commit format requirements
- **FR-019**: System MUST document failure scenarios: hook failures, lint errors, merge conflicts
- **FR-020**: System MUST provide retry strategies for each failure type
- **FR-021**: System MUST document spec update workflow for merge conflicts

#### Issue Templates

- **FR-022**: System MUST provide `.github/ISSUE_TEMPLATE/bug_report.md`
- **FR-023**: System MUST provide `.github/ISSUE_TEMPLATE/feature_request.md`
- **FR-024**: System MUST provide `.github/ISSUE_TEMPLATE/task.md` with Spec Kit frontmatter
- **FR-025**: Templates MUST produce parseable Spec Kit format

#### PR Template

- **FR-026**: System MUST provide `.github/pull_request_template.md`
- **FR-027**: Template MUST include spec directory reference field
- **FR-028**: Template MUST include changelog entry verification checkbox
- **FR-029**: Template MUST include spec-task sync status checkbox
- **FR-030**: Template MUST include required review checklist

#### Project Documentation

- **FR-031**: System MUST provide `README.md` at project root
- **FR-032**: README.md MUST include badges: Build Status, License (AGPL-3.0-or-later), Version, TypeScript, Next.js, SemVer, Conventional Commits, Keep a Changelog, Husky, commitlint
- **FR-033**: README.md MUST include sections: Badges, Description, Features, Quick Start, Installation, Usage, Contributing, License
- **FR-034**: README.md description MUST reflect project purpose from `.kilocode/rules/memory-bank/brief.md`
- **FR-035**: README.md features MUST reflect product context from `.kilocode/rules/memory-bank/product.md`
- **FR-036**: System MUST provide `LICENSE` file at project root
- **FR-037**: LICENSE MUST contain AGPL-3.0-or-later license text
- **FR-038**: System MUST provide `CHANGELOG.md` at project root
- **FR-039**: CHANGELOG.md MUST follow Keep a Changelog format
- **FR-040**: CHANGELOG.md MUST start with initial version 0.1.0 (SemVer initial development phase)

---

## Key Entities

### CommitMessage

Represents a validated conventional commit message:

```typescript
interface CommitMessage {
  type:
    | "feat"
    | "fix"
    | "docs"
    | "style"
    | "refactor"
    | "test"
    | "chore"
    | "perf"
    | "ci"
    | "build"
    | "revert";
  scope?: string; // Optional: matches spec directory name
  description: string; // Max 72 chars, starts with lowercase
  body?: string; // Optional: detailed explanation
  breaking?: boolean; // BREAKING CHANGE footer
  issues?: string[]; // Related issue references
}
```

### ChangelogEntry

Represents a single changelog entry:

```typescript
interface ChangelogEntry {
  type: "added" | "changed" | "deprecated" | "removed" | "fixed" | "security";
  description: string;
  prNumber: number;
  commitHash: string;
  date: string; // ISO 8601
}
```

### SpecReference

Represents the link between issues/tasks and specs:

```typescript
interface SpecReference {
  specId: string; // e.g., "001-workflow-foundation"
  specPath: string; // e.g., "specs/001-workflow-foundation/"
  taskId?: string; // e.g., "T001" if linked to specific task
  issueUrl?: string; // GitHub issue URL for bidirectional sync
}
```

---

## Spec-Kit Workflow Integration

This project follows the [Spec Kit](https://github.com/github/spec-kit) workflow with human-in-the-loop validation:

| Phase        | Command                 | Purpose                           | Required    |
| ------------ | ----------------------- | --------------------------------- | ----------- |
| Constitution | `/speckit.constitution` | Establish foundational principles | ✅ Yes      |
| Specify      | `/speckit.specify`      | Create feature specification      | ✅ Yes      |
| Clarify      | `/speckit.clarify`      | Resolve underspecified areas      | ⚪ Optional |
| Plan         | `/speckit.plan`         | Create implementation plan        | ✅ Yes      |
| Checklist    | `/speckit.checklist`    | Verify requirements completeness  | ⚪ Optional |
| Tasks        | `/speckit.tasks`        | Generate actionable tasks         | ✅ Yes      |
| Analyze      | `/speckit.analyze`      | Cross-artifact consistency check  | ⚪ Optional |
| Implement    | `/speckit.implement`    | Execute implementation            | ✅ Yes      |

### Human Checkpoints (Non-Negotiable)

Every phase transition requires explicit user approval:

1. Agent produces artifact
2. Agent STOPS and presents to user
3. User reviews and provides approval
4. Only then does agent proceed

### Tasks-to-Issues Workflow

When converting tasks to GitHub Issues, use the following approach:

**Primary Tool: `gh` CLI**

Use the GitHub CLI (`gh`) as the primary method for creating and managing GitHub Issues:

```bash
# Create parent issue with spec content
gh issue create --title "Feature: [Feature Name]" --body-file spec.md

# Add plan as comment to parent issue
gh issue comment <parent-issue-number> --body-file plan.md

# Create child task issues
gh issue create --title "[T001] Task description" --body "Task content" --parent <parent-issue-number>
```

**Failover: GitHub MCP Server**

If `gh` CLI is unavailable or fails, use the GitHub MCP server tools as a fallback:

- `mcp_github_issue_write` for creating/updating issues
- `mcp_github_add_issue_comment` for adding comments to issues

> [!CAUTION]
> UNDER NO CIRCUMSTANCES EVER CREATE ISSUES IN REPOSITORIES THAT DO NOT MATCH THE GIT REMOTE URL

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of commits follow conventional commit format (enforced by commitlint)
- **SC-002**: CHANGELOG.md is automatically updated on every PR merge
- **SC-003**: Version bumps are correctly calculated from commit types
- **SC-004**: Pre-commit hooks block 100% of commits with linting errors
- **SC-005**: Agent autonomously resolves commit failures in 95% of cases
- **SC-006**: All issues created from templates contain required frontmatter fields
- **SC-007**: All PRs include completed spec reference checklist
- **SC-008**: README.md displays all required badges correctly on GitHub (Build Status, License, Version, TypeScript, Next.js, SemVer, Conventional Commits, Keep a Changelog, Husky, commitlint)
- **SC-009**: LICENSE file is correctly identified as AGPL-3.0-or-later by automated tools
- **SC-010**: CHANGELOG.md follows Keep a Changelog format with initial version 0.1.0

---

## Technical Configuration

### commitlint.config.js

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "perf",
        "ci",
        "build",
        "revert",
      ],
    ],
    "scope-enum": [
      2,
      "always",
      [
        // Dynamically populated from specs/ directories
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-max-length": [2, "always", 72],
  },
};
```

### Husky Configuration

```json
{
  "hooks": {
    "pre-commit": "lint-staged && bun typecheck",
    "commit-msg": "commitlint --edit $1"
  }
}
```

### lint-staged Configuration

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

---

## Constraints

- Do NOT implement any code - specification documents only
- Use existing `.specify/memory/constitution.md` principles as foundation
- Ensure compatibility with existing project structure
- All paths relative to project root

---

**Version**: 1.5.0 | **Last Updated**: 2026-02-14
