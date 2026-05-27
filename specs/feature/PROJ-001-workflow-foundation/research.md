# Research: Workflow Foundation

**Date**: 2026-02-14
**Feature**: 001-workflow-foundation

## Research Summary

This document consolidates research findings for implementing the workflow foundation infrastructure.

---

## R1: commitlint with Bun

### Decision

Use `@commitlint/cli` and `@commitlint/config-conventional` with Bun's npm compatibility.

### Rationale

- commitlint is a Node.js tool that works with any npm-compatible package manager
- Bun can execute npm packages transparently
- `@commitlint/config-conventional` provides the standard conventional commit rules

### Alternatives Considered

1. **Custom commit message parser**: Rejected - reinventing the wheel, less robust
2. **commitlint via npx**: Rejected - slower than local installation

### Configuration Pattern

```javascript
// commitlint.config.js
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

---

## R2: Husky v9 Configuration

### Decision

Use Husky v9 with simplified configuration format.

### Rationale

- Husky v9 uses a cleaner `.husky/` directory structure
- Native support for modern Node.js/Bun environments
- Simplified hook definition without JSON configuration
- Built-in timeout support

### Alternatives Considered

1. **simple-git-hooks**: Rejected - less mature, smaller community
2. **Yorkie**: Rejected - Vue-specific, less flexible
3. **Pre-commit (Python)**: Rejected - not npm-native

### Configuration Pattern

```bash
# .husky/pre-commit
bun lint && bun typecheck

# .husky/commit-msg
bunx commitlint --edit $1
```

### Installation

```bash
bun add -d husky
bunx husky init
```

---

## R3: GitHub Actions for Changelog & Release (UPDATED)

### Decision

Use **release-please-action** by Google for automated changelog and release management.

### Rationale

- **Official Google-supported action**: Well-maintained, widely adopted (10k+ stars)
- **Native Conventional Commits support**: Works out of the box with our commit format
- **Release PR workflow**: Creates release PRs for review before merging
- **Automatic CHANGELOG.md**: Generates changelog from conventional commits
- **Semantic Versioning**: Automatic version bumps based on commit types
- **Node.js support**: Built-in `release-type: node` for package.json versioning
- **GitHub Release creation**: Creates GitHub releases with release notes

### Why release-please-action over git-cliff

| Feature                   | release-please-action   | git-cliff              |
| ------------------------- | ----------------------- | ---------------------- |
| GitHub Release Creation   | Built-in                | Requires separate step |
| Release PR Workflow       | Built-in review process | No PR workflow         |
| package.json version bump | Automatic               | Manual/scrip required  |
| Maintenance               | Google-supported        | Community project      |
| Workflow complexity       | Simple configuration    | Requires cliff.toml    |
| CI triggers on releases   | Works with GITHUB_TOKEN | May need PAT           |

### How It Works

1. **On push to main**: release-please creates/updates a Release PR
2. **Release PR contains**:
   - CHANGELOG.md updates
   - package.json version bump
   - Commit history organized by type
3. **When you merge the Release PR**:
   - GitHub release is created
   - Version tag is created
   - CHANGELOG.md is committed to main

### Workflow Configuration

```yaml
# .github/workflows/release-please.yml
name: Release Please

on:
  push:
    branches: [main]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          release-type: node
          package-name: glaucus-app
          changelog-types: |
            [
              {"type":"feat","section":"Added","hidden":false},
              {"type":"fix","section":"Fixed","hidden":false},
              {"type":"deprecate","section":"Deprecated","hidden":false},
              {"type":"remove","section":"Removed","hidden":false},
              {"type":"security","section":"Security","hidden":false},
              {"type":"refactor","section":"Changed","hidden":false},
              {"type":"perf","section":"Changed","hidden":false}
            ]

      # Optional: Checkout and do something when a release is created
      - uses: actions/checkout@v4
        if: ${{ steps.release.outputs.release_created }}

      # Example: Create major/minor tags for GitHub Actions
      - name: Tag major and minor versions
        if: ${{ steps.release.outputs.release_created }}
        run: |
          git config user.name github-actions[bot]
          git config user.email 41898282+github-actions[bot]@users.noreply.github.com
          git tag -a v${{ steps.release.outputs.major }} -m "Release v${{ steps.release.outputs.major }}"
          git tag -a v${{ steps.release.outputs.major }}.${{ steps.release.outputs.minor }} -m "Release v${{ steps.release.outputs.major }}.${{ steps.release.outputs.minor }}"
          git push origin v${{ steps.release.outputs.major }}
          git push origin v${{ steps.release.outputs.major }}.${{ steps.release.outputs.minor }}
```

### Configuration File (Optional)

For more advanced configuration, create `release-please-config.json`:

```json
{
  "release-type": "node",
  "package-name": "glaucus-app",
  "changelog-path": "CHANGELOG.md",
  "changelog-types": [
    { "type": "feat", "section": "Added", "hidden": false },
    { "type": "fix", "section": "Fixed", "hidden": false },
    { "type": "deprecate", "section": "Deprecated", "hidden": false },
    { "type": "remove", "section": "Removed", "hidden": false },
    { "type": "security", "section": "Security", "hidden": false },
    { "type": "refactor", "section": "Changed", "hidden": false },
    { "type": "perf", "section": "Changed", "hidden": false }
  ],
  "bump-minor-pre-major": true,
  "include-v-in-tag": true
}
```

### Version Manifest File

Create `.release-please-manifest.json` for initial version:

```json
{
  ".": "0.1.0"
}
```

### Alternatives Considered

1. **semantic-release**: Rejected - too opinionated, requires specific branch structure, more complex setup
2. **standard-version**: Rejected - deprecated, no longer maintained
3. **git-cliff**: Rejected - more manual setup, no release PR workflow
4. **Manual changelog**: Rejected - error-prone, inconsistent, defeats automation purpose

---

## R4: Semantic Versioning Automation (UPDATED)

### Decision

Semantic versioning is handled automatically by release-please-action.

### Rationale

- release-please-action handles version bumps based on conventional commits
- No separate tooling needed
- Version stored in package.json (standard for Node.js projects)

### Version Bump Logic

| Commit Type                    | Version Bump           |
| ------------------------------ | ---------------------- |
| `feat:`                        | MINOR (0.1.0 -> 0.2.0) |
| `fix:`                         | PATCH (0.1.0 -> 0.1.1) |
| `feat!:` or `BREAKING CHANGE:` | MAJOR (0.1.0 -> 1.0.0) |

### Pre-release Support

For pre-release versions, configure in release-please-config.json:

```json
{
  "prerelease": true,
  "prerelease-type": "alpha"
}
```

This generates versions like `0.1.0-alpha.1`, `0.1.0-alpha.2`, etc.

---

## R5: lint-staged with Bun

### Decision

Use lint-staged with Bun for faster execution.

### Rationale

- lint-staged runs linters on staged files only, improving performance
- Bun executes lint-staged faster than npm/npx
- Integrates seamlessly with Husky pre-commit hook

### Alternatives Considered

1. **Pre-commit on all files**: Rejected - slower, redundant
2. **Nano-staged**: Rejected - less mature, smaller community

### Configuration Pattern

```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

### Hook Integration

```bash
# .husky/pre-commit
bunx lint-staged && bun typecheck
```

---

## Dependencies Summary

### Production Dependencies

None (infrastructure only)

### Development Dependencies

| Package                           | Version | Purpose                   |
| --------------------------------- | ------- | ------------------------- |
| `@commitlint/cli`                 | ^19.x   | Commit message validation |
| `@commitlint/config-conventional` | ^19.x   | Conventional commit rules |
| `husky`                           | ^9.x    | Git hooks management      |
| `lint-staged`                     | ^15.x   | Staged files linting      |
| `prettier`                        | ^3.x    | Code formatting           |

### GitHub Actions (workflow dependencies)

| Action                             | Version | Purpose                        |
| ---------------------------------- | ------- | ------------------------------ |
| `googleapis/release-please-action` | v4      | Changelog & release automation |
| `actions/checkout`                 | v4      | Repository checkout            |

---

## Questions Resolved

| ID  | Question                       | Resolution                                   |
| --- | ------------------------------ | -------------------------------------------- |
| Q1  | Does commitlint work with Bun? | Yes, via npm compatibility                   |
| Q2  | Husky v9 setup for Bun?        | Use `bunx husky init`                        |
| Q3  | Changelog tool choice?         | **release-please-action** (Google-supported) |
| Q4  | Hook timeout enforcement?      | Husky native + wrapper if needed             |
| Q5  | How to handle releases?        | Release PR workflow via release-please       |

---

## Implementation Notes

1. **Install Order**: Install commitlint first, then Husky, then lint-staged
2. **Testing**: Test each component independently before integration
3. **Documentation**: Update `.kilocode/rules/commit.md` with any discovered edge cases
4. **Release PR workflow**: Review and merge release PRs to create releases
5. **Permissions**: Ensure GitHub Actions has `contents: write` and `pull-requests: write` permissions

---

## release-please-action Benefits for Glaucus App

1. **Automated Release Notes**: When merging a release PR, GitHub release is created with notes
2. **Consistent Changelog**: Standard changelog format from conventional commits
3. **Version in package.json**: Automatic version bumping
4. **No Manual Steps**: Just merge the release PR when ready
5. **Integration Ready**: Can trigger npm publish, Docker build, etc. on release

---

**Version**: 2.0.0 | **Last Updated**: 2026-02-14
