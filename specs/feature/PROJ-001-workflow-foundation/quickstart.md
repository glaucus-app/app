# Quickstart: Workflow Foundation

**Date**: 2026-02-14
**Feature**: 001-workflow-foundation

## Overview

This guide provides step-by-step instructions for setting up and testing the workflow foundation infrastructure, including the **release-please-action** for automated changelog and release management.

---

## Prerequisites

- Bun installed (`bun --version` >= 1.0.0)
- Git repository initialized
- GitHub repository with Actions enabled

---

## Installation

### Step 1: Install Dependencies

```bash
bun add -d @commitlint/cli @commitlint/config-conventional husky lint-staged prettier
```

### Step 2: Initialize Husky

```bash
bunx husky init
```

This creates:

- `.husky/` directory
- `.husky/_/` helper scripts
- Default pre-commit hook

### Step 3: Create Commitlint Configuration

Create `commitlint.config.js` at repository root:

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
        // Add spec directory names here
        "optimize",
        "gems",
        "auth",
        "workflow",
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
    "subject-max-length": [2, "always", 72],
  },
};
```

### Step 4: Configure Pre-commit Hook

Edit `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bunx lint-staged && bun typecheck
```

### Step 5: Configure Commit-msg Hook

Create `.husky/commit-msg`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bunx commitlint --edit $1
```

### Step 6: Configure lint-staged

Create `.lintstagedrc.json` at repository root:

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

### Step 7: Create release-please Workflow

Create `.github/workflows/release-please.yml`:

```yaml
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
          package-name: di-lab
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

      # Optional: Create major/minor version tags
      - uses: actions/checkout@v4
        if: ${{ steps.release.outputs.release_created }}
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

### Step 8: Create release-please Configuration (Optional)

Create `release-please-config.json` for advanced configuration:

```json
{
  "release-type": "node",
  "package-name": "di-lab",
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

### Step 9: Create Version Manifest

Create `.release-please-manifest.json`:

```json
{
  ".": "0.1.0"
}
```

---

## Testing

### Test Pre-commit Hook

1. **Test lint blocking**:

   ```bash
   # Introduce a lint error
   echo "const x=1" > test.ts
   git add test.ts
   git commit -m "test: check lint hook"
   # Should fail with lint errors
   rm test.ts
   ```

2. **Test typecheck blocking**:

   ```bash
   # Introduce a type error
   echo "const x: string = 1" > test.ts
   git add test.ts
   git commit -m "test: check typecheck hook"
   # Should fail with type errors
   rm test.ts
   ```

3. **Test successful commit**:
   ```bash
   # Clean code
   echo "const x: string = 'hello'" > test.ts
   git add test.ts
   git commit -m "test: check successful hook"
   # Should pass
   git revert HEAD --no-edit
   rm test.ts
   ```

### Test Commit-msg Hook

1. **Test invalid format**:

   ```bash
   git commit -m "update stuff"
   # Should fail with format guidance
   ```

2. **Test missing type**:

   ```bash
   git commit -m "added new feature"
   # Should fail with type requirement
   ```

3. **Test valid commit**:

   ```bash
   git commit -m "feat: add new feature"
   # Should pass
   ```

4. **Test with scope**:

   ```bash
   git commit -m "feat(optimize): add greedy algorithm"
   # Should pass
   ```

5. **Test breaking change**:
   ```bash
   git commit -m "feat!: change API contract"
   # Should pass (breaking change marker)
   ```

### Test release-please Workflow

1. **Push to main** (after merging PR):
   - release-please-action will create a Release PR automatically
   - Review the Release PR in GitHub

2. **Review Release PR**:
   - Check CHANGELOG.md changes
   - Check package.json version bump
   - Verify commit grouping is correct

3. **Merge Release PR**:
   - GitHub release is created
   - Version tag is created
   - CHANGELOG.md is updated in main

4. **Verify release**:
   - Check GitHub Releases page
   - Verify version tag exists
   - Check CHANGELOG.md in main branch

---

## Release PR Workflow

### How It Works

```
Conventional Commits on main
           |
           v
release-please-action creates Release PR
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
           +---> Git tag created (v0.1.0, v0.1, etc.)
```

### Version Bump Logic

| Commit Type                    | Version Bump           |
| ------------------------------ | ---------------------- |
| `feat:`                        | MINOR (0.1.0 -> 0.2.0) |
| `fix:`                         | PATCH (0.1.0 -> 0.1.1) |
| `feat!:` or `BREAKING CHANGE:` | MAJOR (0.1.0 -> 1.0.0) |

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

## Troubleshooting

### Hook Not Running

**Symptom**: Commits succeed without validation

**Solution**:

```bash
# Check Husky installation
ls -la .husky/

# Reinstall hooks
bunx husky init

# Verify hook is executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
```

### Commitlint Fails Silently

**Symptom**: Commits blocked with no error message

**Solution**:

```bash
# Test commitlint directly
echo "bad message" | bunx commitlint

# Check configuration
cat commitlint.config.js
```

### Lint-staged Too Slow

**Symptom**: Pre-commit takes > 30 seconds

**Solution**:

```bash
# Check what files are staged
git diff --cached --name-only

# Reduce scope in .lintstagedrc.json
{
  "src/**/*.{ts,tsx}": ["eslint --fix"]  # More specific pattern
}
```

### Timeout Errors

**Symptom**: Hook times out

**Solution**:

```bash
# Check if typecheck is slow
bun typecheck

# Consider running typecheck in CI only
# Edit .husky/pre-commit:
bunx lint-staged  # Remove typecheck for faster commits
```

### release-please Not Creating Release PR

**Symptom**: No Release PR created after push to main

**Solution**:

1. Check GitHub Actions permissions (`contents: write`, `pull-requests: write`)
2. Verify workflow triggers on `push: main`
3. Check Actions tab for workflow errors
4. Ensure at least one conventional commit exists since last release

### Release PR Won't Merge

**Symptom**: Release PR has conflicts or won't merge

**Solution**:

1. Update main branch with latest changes
2. Close and let release-please recreate, or
3. Manually resolve conflicts in CHANGELOG.md

---

## Configuration Reference

### Commit Types

| Type       | Changelog Section | Example                           |
| ---------- | ----------------- | --------------------------------- |
| `feat`     | Added             | `feat: add user authentication`   |
| `fix`      | Fixed             | `fix: resolve login redirect`     |
| `docs`     | Documentation     | `docs: update API reference`      |
| `style`    | -                 | `style: format code`              |
| `refactor` | Changed           | `refactor: simplify auth logic`   |
| `test`     | Tests             | `test: add auth unit tests`       |
| `chore`    | -                 | `chore: update dependencies`      |
| `perf`     | Changed           | `perf: optimize database queries` |
| `ci`       | CI                | `ci: add deployment workflow`     |
| `build`    | -                 | `build: update Docker config`     |
| `revert`   | -                 | `revert: undo last commit`        |

### Scope Examples

| Scope      | Use Case                 |
| ---------- | ------------------------ |
| `optimize` | Gem optimization feature |
| `gems`     | Gem data management      |
| `auth`     | Authentication system    |
| `workflow` | CI/CD and tooling        |

### release-please-action Inputs

| Input           | Description                 | Default                         |
| --------------- | --------------------------- | ------------------------------- |
| `token`         | GitHub token                | `secrets.GITHUB_TOKEN`          |
| `release-type`  | Release strategy            | Required                        |
| `package-name`  | Package name for versioning | -                               |
| `config-file`   | Path to config              | `release-please-config.json`    |
| `manifest-file` | Path to manifest            | `.release-please-manifest.json` |

### release-please-action Outputs

| Output             | Description                       |
| ------------------ | --------------------------------- |
| `releases_created` | `true` if release created         |
| `release_created`  | `true` if root release created    |
| `tag_name`         | Created tag name (e.g., `v0.1.0`) |
| `major`            | Major version number              |
| `minor`            | Minor version number              |
| `patch`            | Patch version number              |

---

## Next Steps

After setting up the workflow foundation:

1. **Create initial commit**:

   ```bash
   git add -A
   git commit -m "chore: setup workflow foundation"
   git push -u origin 001-workflow-foundation
   ```

2. **Create pull request**:
   - Use the PR template
   - Reference this spec in the checklist

3. **Merge to main**:
   - Verify release-please creates Release PR
   - Review and merge Release PR
   - Check GitHub release is created

---

**Version**: 2.0.0 | **Last Updated**: 2026-02-14
