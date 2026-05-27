# Data Model: Workflow Foundation

**Date**: 2026-02-14
**Feature**: 001-workflow-foundation

## Overview

This document defines the data structures and entities used by the workflow foundation infrastructure. Since this feature is configuration-based, the "data model" consists primarily of configuration schemas and type definitions.

---

## Entities

### CommitMessage

Represents a validated conventional commit message.

```typescript
interface CommitMessage {
  /** Commit type - determines changelog section mapping */
  type: CommitType;

  /** Optional scope - typically matches spec directory name */
  scope?: string;

  /** Commit description - max 72 chars, starts lowercase */
  description: string;

  /** Optional body for detailed explanation */
  body?: string;

  /** Indicates breaking change */
  breaking?: boolean;

  /** Footer with breaking change description */
  breakingChange?: string;

  /** Related issue references */
  issues?: string[];
}

type CommitType =
  | "feat" // New feature → Added
  | "fix" // Bug fix → Fixed
  | "docs" // Documentation
  | "style" // Code style (formatting)
  | "refactor" // Code refactoring → Changed
  | "test" // Tests
  | "chore" // Maintenance
  | "perf" // Performance → Changed
  | "ci" // CI/CD
  | "build" // Build system
  | "revert"; // Revert commit
```

**Validation Rules**:

- `type` is required and must be one of the defined types
- `scope` must match a spec directory name if provided
- `description` must start with lowercase letter
- `description` must not exceed 72 characters
- If `breaking` is true, `breakingChange` should be provided

**Example**:

```
feat(optimize): add greedy algorithm for gem ranking

Implements a greedy optimization algorithm that ranks gem upgrades
by power gain per resource cost.

BREAKING CHANGE: Optimization API response format changed

Closes #123
```

---

### ChangelogEntry

Represents a single changelog entry.

```typescript
interface ChangelogEntry {
  /** Changelog section */
  type: ChangelogSection;

  /** Entry description (from commit message) */
  description: string;

  /** PR number for reference */
  prNumber: number;

  /** Commit hash for traceability */
  commitHash: string;

  /** ISO 8601 date */
  date: string;

  /** Breaking change indicator */
  breaking?: boolean;
}

type ChangelogSection =
  | "added" // feat commits
  | "changed" // refactor, perf commits
  | "deprecated" // deprecate commits
  | "removed" // remove commits
  | "fixed" // fix commits
  | "security"; // security commits
```

**Mapping from CommitType to ChangelogSection**:

| Commit Type | Changelog Section |
| ----------- | ----------------- |
| `feat`      | `added`           |
| `fix`       | `fixed`           |
| `deprecate` | `deprecated`      |
| `remove`    | `removed`         |
| `security`  | `security`        |
| `refactor`  | `changed`         |
| `perf`      | `changed`         |

---

### SpecReference

Represents the link between issues/tasks and specifications.

```typescript
interface SpecReference {
  /** Spec identifier (e.g., "001-workflow-foundation") */
  specId: string;

  /** Absolute path to spec directory */
  specPath: string;

  /** Optional task ID within spec */
  taskId?: string;

  /** GitHub issue URL for bidirectional sync */
  issueUrl?: string;

  /** Issue state for tracking */
  issueState?: "open" | "closed";
}
```

**Example**:

```json
{
  "specId": "001-workflow-foundation",
  "specPath": "specs/001-workflow-foundation",
  "taskId": "T001",
  "issueUrl": "https://github.com/user/glaucus-app/issues/42",
  "issueState": "open"
}
```

---

### CommitlintConfig

Configuration schema for commitlint.

```typescript
interface CommitlintConfig {
  /** Extend base configurations */
  extends?: string[];

  /** Custom rules */
  rules: {
    [ruleName: string]: [
      severity: 0 | 1 | 2,
      condition: "always" | "never",
      value?: unknown,
    ];
  };

  /** Optional scope enum for validation */
  "scope-enum"?: [2, "always", string[]];
}
```

**Default Rules**:

| Rule                 | Severity  | Condition | Value                                                                                            |
| -------------------- | --------- | --------- | ------------------------------------------------------------------------------------------------ |
| `type-enum`          | 2 (error) | always    | `['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build', 'revert']` |
| `subject-case`       | 2 (error) | always    | `'lower-case'`                                                                                   |
| `subject-max-length` | 2 (error) | always    | `72`                                                                                             |
| `scope-enum`         | 2 (error) | always    | `[/* spec directories */]`                                                                       |

---

### HuskyConfig

Configuration for Husky hooks.

```typescript
interface HuskyConfig {
  /** Pre-commit hook configuration */
  preCommit?: {
    /** Commands to run */
    commands: string[];
    /** Timeout in seconds */
    timeout?: number;
  };

  /** Commit-msg hook configuration */
  commitMsg?: {
    /** Commands to run */
    commands: string[];
    /** Timeout in seconds */
    timeout?: number;
  };
}
```

**Default Hook Structure**:

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bunx lint-staged && bun typecheck
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bunx commitlint --edit $1
```

---

### LintStagedConfig

Configuration for lint-staged.

```typescript
interface LintStagedConfig {
  /** Glob pattern -> commands mapping */
  [globPattern: string]: string[];
}
```

**Default Configuration**:

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

---

## Relationships

```
┌─────────────────┐
│  CommitMessage  │
│  ─────────────  │
│  type           │──────┐
│  scope          │      │
│  description    │      │
│  breaking       │      │
└─────────────────┘      │
                         │ maps to
                         ▼
┌─────────────────┐
│ ChangelogEntry  │
│ ──────────────  │
│ type            │
│ description     │
│ prNumber        │
│ commitHash      │
└─────────────────┘

┌─────────────────┐
│  SpecReference  │
│  ─────────────  │
│  specId         │◄────┐
│  taskId         │     │
│  issueUrl       │     │ references
└─────────────────┘     │
                        │
┌─────────────────┐     │
│ commitlint      │     │
│ config          │─────┘
│ ─────────────── │
│ scope-enum      │
└─────────────────┘
```

---

## State Transitions

### Commit Validation Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   commit    │────▶│  commitlint │────▶│  validated  │
│   message   │     │   check     │     │   commit    │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          │ failure
                          ▼
                    ┌─────────────┐
                    │   blocked   │
                    │  with error │
                    └─────────────┘
```

### Changelog Entry Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PR merge  │────▶│   extract   │────▶│   append    │
│  to main    │     │   commits   │     │ to CHANGELOG│
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## File Storage

| Entity           | Storage Location       | Format        |
| ---------------- | ---------------------- | ------------- |
| CommitMessage    | Git commit history     | Plain text    |
| ChangelogEntry   | `CHANGELOG.md`         | Markdown      |
| SpecReference    | Task frontmatter       | YAML          |
| CommitlintConfig | `commitlint.config.js` | JavaScript    |
| HuskyConfig      | `.husky/` directory    | Shell scripts |
| LintStagedConfig | `.lintstagedrc.json`   | JSON          |

---

**Version**: 1.0.0 | **Last Updated**: 2026-02-14
