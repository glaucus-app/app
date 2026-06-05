# Semantic-Release Migration & AI-Powered Release Workflows

## Document Purpose

This document evaluates migrating the Glaucus app from **Release Please** to **semantic-release**, provides a complete migration plan, and evaluates modern AI-powered release workflow enhancements for the Kilo/Gastown convoy system.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [semantic-release Configuration for Glaucus](#2-semantic-release-configuration-for-glaucus)
3. [AI-Powered Development Workflow Enhancements](#3-ai-powered-development-workflow-enhancements)
4. [Migration Plan](#4-migration-plan)
5. [AI-Optimized Release Workflow Design](#5-ai-optimized-release-workflow-design)
6. [Alternative Tools Comparison](#6-alternative-tools-comparison)
7. [Recommendation](#7-recommendation)

---

## 1. Current State Analysis

### 1.1 What Release Please Does Today

| Capability | Implementation |
|---|---|
| Version bump | Automatic via `release-please-config.json` (`release-type: "node"`) |
| Changelog generation | Automatic, grouped by `changelog-types` (feat→Added, fix→Fixed, etc.) |
| GitHub Release | Automatic on merge of Release PR |
| Tagging | Creates `v{major}` and `v{major}.{minor}` tags |
| Trigger | Push to `main` branch |
| Config files | `.github/workflows/release-please.yml`, `release-please-config.json`, `.release-please-manifest.json` |

### 1.2 Current Commit Convention

- **Format**: `type(scope): description` (Conventional Commits)
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`
- **Scopes**: Defined in `commitlint.config.js` (`api`, `ui`, `core`, `gems`, `auth`, `db`, `cd`, etc.)
- **Validation**: Husky `pre-commit` (lint-staged + typecheck) and `commit-msg` (commitlint)
- **Package manager**: Bun (not npm)

### 1.3 Pain Points with Release Please

1. **PR-based model** — Release Please creates a "Release PR" that must be manually merged. This adds friction in a high-velocity AI agent workflow where agents push directly to `main`.
2. **Limited plugin ecosystem** — Hard to extend with custom release steps (e.g., notify Discord, update docs site, trigger deployment).
3. **No pre-release support** — No built-in beta/alpha/next channel releases.
4. **Bun incompatibility** — Release Please reads/writes `package.json` assuming npm semantics; works but doesn't integrate with `bun` lifecycle.
5. **Monorepo overhead** — Manifest-based config is designed for monorepos; Glaucus is a single package.

---

## 2. semantic-release Configuration for Glaucus

### 2.1 Recommended Plugin Stack

| Plugin | Purpose | Required |
|---|---|---|
| `@semantic-release/commit-analyzer` | Determine next version from commits | Yes |
| `@semantic-release/release-notes-generator` | Generate release notes from commits | Yes |
| `@semantic-release/changelog` | Write/update CHANGELOG.md | Yes |
| `@semantic-release/npm` | Bump version in package.json | Yes (with config) |
| `@semantic-release/git` | Commit changelog + version bump back to repo | Yes |
| `@semantic-release/github` | Create GitHub Release + upload assets | Yes |

### 2.2 `.releaserc.json` Configuration

```json
{
  "branches": [
    "main",
    { "name": "next", "prerelease": true },
    { "name": "beta", "prerelease": true }
  ],
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      {
        "preset": "conventionalcommits",
        "releaseRules": [
          { "type": "docs", "release": "patch" },
          { "type": "refactor", "release": "patch" },
          { "type": "perf", "release": "minor" },
          { "type": "style", "release": "patch" },
          { "type": "test", "release": "patch" },
          { "type": "build", "release": "patch" },
          { "type": "ci", "release": "patch" },
          { "type": "chore", "release": "patch" },
          { "scope": "security", "release": "patch" },
          { "breaking": true, "release": "major" }
        ],
        "parserOpts": {
          "noteKeywords": ["BREAKING CHANGE", "BREAKING-CHANGE"]
        }
      }
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        "preset": "conventionalcommits",
        "presetConfig": {
          "types": [
            { "type": "feat", "section": "Features", "hidden": false },
            { "type": "fix", "section": "Bug Fixes", "hidden": false },
            { "type": "perf", "section": "Performance Improvements", "hidden": false },
            { "type": "refactor", "section": "Code Refactoring", "hidden": false },
            { "type": "docs", "section": "Documentation", "hidden": false },
            { "type": "style", "section": "Styles", "hidden": false },
            { "type": "test", "section": "Tests", "hidden": false },
            { "type": "build", "section": "Build System", "hidden": false },
            { "type": "ci", "section": "Continuous Integration", "hidden": false },
            { "type": "chore", "section": "Chores", "hidden": true }
          ]
        },
        "writerOpts": {
          "groupBy": "type",
          "commitGroupsSort": ["Features", "Bug Fixes", "Performance Improvements", "Code Refactoring"],
          "commitsSort": ["scope", "subject"]
        }
      }
    ],
    [
      "@semantic-release/changelog",
      {
        "changelogFile": "CHANGELOG.md",
        "changelogTitle": "# Glaucus Changelog\n\nAll notable changes to this project will be documented in this file."
      }
    ],
    [
      "@semantic-release/npm",
      {
        "npmPublish": false,
        "pkgRoot": "."
      }
    ],
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "package.json"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    [
      "@semantic-release/github",
      {
        "assets": [],
        "successComment": ":tada: This release is included in version ${nextRelease.version}!",
        "failComment": "This PR was not included in the release due to the following errors:\n\n${failures}",
        "failTitle": "Release Failed",
        "labels": ["release"],
        "releasedLabels": ["released"]
      }
    ]
  ]
}
```

### 2.3 Key Configuration Decisions

| Decision | Rationale |
|---|---|
| `npmPublish: false` | Glaucus is `"private": true` — no npm publishing needed |
| Custom `releaseRules` | Maps non-standard types (docs, style, test, build, ci, chore) to `patch` releases, matching the project's existing commit types |
| `chore` hidden in changelog | Maintenance tasks don't belong in user-facing changelog |
| `[skip ci]` in commit message | Prevents release commit from triggering another CI run |
| Prerelease branches | `next` and `beta` branches enable pre-release channels |
| `conventionalcommits` preset | Matches existing commitlint configuration |

### 2.4 GitHub Actions Workflow

```yaml
# .github/workflows/semantic-release.yml
name: Semantic Release

on:
  push:
    branches: [main, next, beta]

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, '[skip ci]')"
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Run type check
        run: bun typecheck

      - name: Run lint
        run: bun lint

      - name: Run tests
        run: bun test:run

      - name: Semantic Release
        uses: cycjimmy/semantic-release-action@v4
        with:
          semantic_version: 24
          extra_plugins: |
            @semantic-release/changelog@6
            @semantic-release/git@10
            conventional-changelog-conventionalcommits@8
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 2.5 Required Dev Dependencies

```bash
bun add -D semantic-release \
  @semantic-release/commit-analyzer \
  @semantic-release/release-notes-generator \
  @semantic-release/changelog \
  @semantic-release/git \
  @semantic-release/npm \
  @semantic-release/github \
  conventional-changelog-conventionalcommits
```

---

## 3. AI-Powered Development Workflow Enhancements

### 3.1 How semantic-release Integrates with AI Agent Workflows

#### Direct Push Model (Recommended for Gastown/Kilo)

semantic-release operates **immediately on push to main**. This is ideal for AI agent workflows:

```
Polecat pushes → GitHub Actions triggers → semantic-release analyzes commits → Release created
```

**Advantages over Release Please for AI agents:**
1. **No manual merge step** — Agents push, release happens automatically. No Release PR to review and merge.
2. **Immediate feedback** — Release notes are generated and published within the same CI run.
3. **Failure is visible** — If semantic-release fails (lint/test failure, no release-worthy commits), the CI check fails visibly.
4. **Programmatic access** — The `cycjimmy/semantic-release-action` exposes outputs (`new_release_published`, `new_release_version`) that downstream steps can use.

#### Integration Point: gt_done Enhancement

Polecats calling `gt_done` could optionally include release metadata:

```
gt_done(branch="feat/gem-optimizer", summary="feat(gems): add greedy algorithm")
→ semantic-release detects `feat` type on next push to main
→ Triggers MINOR version bump automatically
```

### 3.2 PR-Based vs Commit-Based Release Workflows

| Aspect | Commit-Based (semantic-release) | PR-Based (Release Please) |
|---|---|---|
| **Speed** | Immediate on merge to main | Requires Release PR merge |
| **Human Control** | Opt-in via protected branches | Required (Release PR review) |
| **AI Agent Fit** | Excellent — push-and-go | Poor — requires manual merge |
| **Batching** | Multiple commits batched per release | Single Release PR per cycle |
| **Pre-releases** | Built-in (next/beta branches) | Limited |
| **Changelog Accuracy** | Generated from actual commits | Generated from PR squash merges |
| **Rollback** | Revert commit + new release | Unmerge Release PR |

**Recommendation for Glaucus**: Commit-based with branch protection. AI agents push to feature branches, PRs are merged to main, semantic-release triggers automatically.

### 3.3 Release Notes Generation from PR Descriptions and Commits

semantic-release generates notes from **commits**, not PR descriptions. However, when using squash merges, the PR title becomes the commit subject and the PR body becomes the commit body.

**Optimization for AI agents:**

When a polecat creates a PR, include structured metadata in the PR body that maps to conventional commit format:

```markdown
## Summary
Created docs/ONBOARDING.md with 9 sections covering prerequisites through best practices.

## Commit Mapping
- Type: docs
- Scope: (none)
- Description: add project onboarding template

## Breaking Changes
None
```

When squashed, this becomes:
```
docs: add project onboarding template

Created docs/ONBOARDING.md with 9 sections covering prerequisites through best practices.
```

### 3.4 LLM-Assisted Release Summaries

A future enhancement: add a custom semantic-release plugin that uses an LLM (via Kilo LLM Gateway) to generate human-readable release summaries from the structured commit data:

```javascript
// plugins/llm-release-summary.js
const { execSync } = require('child_process');

module.exports = {
  async verifyConditions(pluginConfig, context) {
    // Verify LLM API key is available
  },
  async prepare(pluginConfig, context) {
    // Generate summary via LLM
    const commits = context.commits.map(c => `${c.hash}: ${c.subject}`).join('\n');
    const summary = await callLLM(`Generate a concise release summary from these commits:\n${commits}`);
    context.nextRelease.notes += `\n\n## AI Summary\n\n${summary}`;
  },
};
```

---

## 4. Migration Plan

### 4.1 Step-by-Step Migration from Release Please

#### Step 1: Install Dependencies

```bash
bun add -D semantic-release \
  @semantic-release/commit-analyzer \
  @semantic-release/release-notes-generator \
  @semantic-release/changelog \
  @semantic-release/git \
  @semantic-release/npm \
  @semantic-release/github \
  conventional-changelog-conventionalcommits
```

#### Step 2: Create `.releaserc.json`

Place the configuration from [Section 2.2](#22-releasercjson-configuration) at the project root.

#### Step 3: Create New GitHub Actions Workflow

Create `.github/workflows/semantic-release.yml` with the configuration from [Section 2.4](#24-github-actions-workflow).

#### Step 4: Remove Release Please Files

```bash
# Remove workflow
rm .github/workflows/release-please.yml

# Remove config files (keep CHANGELOG.md!)
rm release-please-config.json
rm .release-please-manifest.json
```

#### Step 5: Update `package.json` (Optional)

Add a release script for manual/local testing:

```json
{
  "scripts": {
    "release:dry-run": "semantic-release --dry-run",
    "release:debug": "semantic-release --dry-run --debug"
  }
}
```

#### Step 6: Remove Release Please from Agent Documentation

Update `.kilocode/rules/commit.md`:
- Remove the "Release-Please Workflow" section (lines 267-335)
- Add a "semantic-release Workflow" section

#### Step 7: Test the Migration

1. Create a test commit: `feat: test semantic release integration`
2. Push to a feature branch, merge to `main`
3. Verify semantic-release runs in GitHub Actions
4. Check that CHANGELOG.md was updated
5. Check that a GitHub Release was created
6. Verify package.json version was bumped

### 4.2 Backward Compatibility with Existing CHANGELOG.md

semantic-release's `@semantic-release/changelog` **prepends** new entries to the existing file. Your existing CHANGELOG.md will be preserved with all historical entries intact.

**Important**: Before migration, ensure CHANGELOG.md exists and has content. semantic-release expects the file to exist if configured.

If CHANGELOG.md does not exist, semantic-release will create it with the `changelogTitle` header from the config.

### 4.3 Version Continuity

semantic-release uses **git tags** to determine the current version, not `package.json` or `.release-please-manifest.json`. Since Release Please already creates tags (e.g., `v0.5.1`), semantic-release will pick up from the latest tag automatically.

**Verification command:**
```bash
git describe --tags --abbrev=0
# Should output: v0.5.1 (or whatever the latest release is)
```

### 4.4 Migration Checklist

- [ ] Install semantic-release dependencies
- [ ] Create `.releaserc.json` at project root
- [ ] Create `.github/workflows/semantic-release.yml`
- [ ] Test with `--dry-run` on feature branch
- [ ] Verify CHANGELOG.md compatibility
- [ ] Verify git tag detection
- [ ] Remove `.github/workflows/release-please.yml`
- [ ] Remove `release-please-config.json`
- [ ] Remove `.release-please-manifest.json`
- [ ] Update `.kilocode/rules/commit.md` documentation
- [ ] Update `AGENTS.md` if it references Release Please
- [ ] Merge to main and verify first release works
- [ ] Delete old Release Please branch if one exists

---

## 5. AI-Optimized Release Workflow Design

### 5.1 Commit Message Conventions for AI Agents

AI agents (Kilo/polecats) must produce conventional commits that semantic-release can parse. The existing `commitlint.config.js` already enforces this. The following mapping ensures semantic-release produces accurate version bumps:

| AI Agent Action | Commit Type | Version Impact |
|---|---|---|
| New feature, component, or endpoint | `feat(scope): description` | MINOR |
| Bug fix, error handling, validation | `fix(scope): description` | PATCH |
| Performance optimization | `perf(scope): description` | MINOR |
| Code refactoring | `refactor(scope): description` | PATCH |
| Documentation (agent guides, specs) | `docs: description` | PATCH |
| Test additions | `test: description` | PATCH |
| CI/CD workflow changes | `ci: description` | PATCH |
| Build configuration | `build: description` | PATCH |
| Dependency updates | `chore(deps): description` | PATCH |
| Breaking API or schema change | `feat(scope)!: description` | MAJOR |

### 5.2 PR Templates That Feed Into Release Notes

When a polecat creates a PR via `gh pr create`, the PR body should follow this template to ensure clean squash-merge commit messages:

```markdown
## Summary
<1-3 bullet points of what changed>

## Release Impact
- **Type**: feat | fix | refactor | docs
- **Scope**: api | ui | gems | auth | db | core
- **Breaking**: yes | no
- **Migration Required**: yes | no

## Changes
- File: `path/to/file` — What was changed
- File: `path/to/file` — What was changed

## Testing
- [ ] bun typecheck passes
- [ ] bun lint passes
- [ ] bun test:run passes (if tests exist)
```

When squashed, this produces a clean conventional commit where:
- **Subject**: PR title (must follow `type(scope): description` format)
- **Body**: Summary + testing notes (appears in release notes)

### 5.3 Integration with Kilo/Gastown Convoy Workflows

#### 5.3.1 Automated Release Tagging

When a convoy's beads are all closed and the feature branch is merged:

```
Convoy "Glaucus Release Workflow Evaluation" → All beads closed → PR merged to main
→ semantic-release detects merge commit → Analyzes all squashed commits
→ If feat commits present: MINOR bump + changelog entry
→ If only fix/refactor/docs: PATCH bump
→ GitHub Release created automatically
```

#### 5.3.2 Bead-to-Commit Traceability

Each bead in Gastown should include a reference in the PR body that maps to release notes:

```markdown
## Gastown Metadata
- **Convoy**: f79efc7b-3386-4b8a-ae32-fec6648c2914
- **Bead**: d4a0e08a-b2c6-439c-a053-f76fef759bcb
- **Agent**: Ember-polecat
```

This enables tracing any release back to the specific bead that produced it.

#### 5.3.3 Branch Protection for AI Safety

To prevent AI agents from accidentally triggering releases on `main`:

```yaml
# GitHub Repository Settings (manual setup)
# Branch: main
# - Require pull request reviews before merging
# - Require status checks to pass (typecheck, lint, test)
# - Require branches to be up to date
# - Restrict pushes to main (no direct pushes)
```

This ensures all AI agent work goes through PR review before triggering semantic-release.

### 5.4 Release Verification Pipeline

Add a pre-release verification step to the workflow:

```yaml
- name: Verify release readiness
  run: |
    bun typecheck
    bun lint
    bun test:run

- name: Build production app
  run: bun build

- name: Semantic Release
  uses: cycjimmy/semantic-release-action@v4
  # ... rest of config
```

This ensures only buildable, tested code is released.

---

## 6. Alternative Tools Comparison

### 6.1 Modern Release Automation Landscape

| Tool | Type | PR-Based | Plugin Ecosystem | Bun Support | AI Agent Fit |
|---|---|---|---|---|---|
| **semantic-release** | Commit-based | No | Excellent (50+ plugins) | Compatible | Excellent |
| **Release Please** | PR-based | Yes | Limited | Partial | Poor |
| **auto** (Intuit) | Commit/PR hybrid | Optional | Good | Compatible | Good |
| **changesets** | PR-based (monorepo) | Yes | Moderate | Compatible | Fair |
| **release-it** | CLI-first | No | Good | Compatible | Good |
| **auto-changelog** | Changelog only | N/A | None | Compatible | Fair |

### 6.2 Why semantic-release Over Alternatives

**vs Release Please**: Immediate release on merge, no manual PR review step, richer plugin ecosystem, prerelease channels.

**vs auto**: More mature ecosystem, better GitHub integration, conventional commits is the industry standard, better documentation.

**vs changesets**: changesets is designed for monorepos. Glaucus is a single package. Overkill.

**vs release-it**: release-it is CLI-driven (requires human interaction). semantic-release is fully automated (CI-native).

### 6.3 When NOT to Migrate

Keep Release Please if:
1. You want **human-in-the-loop** releases (Release PR must be manually merged)
2. You have **complex monorepo** versioning needs (Release Please's manifest handles this well)
3. Your team **reviews changelogs before release** (Release PR acts as review gate)
4. You rely on **release-please's GitHub API** for downstream tooling

---

## 7. Recommendation

### 7.1 Recommended Approach: Migrate to semantic-release

**Rationale:**
1. **AI agent alignment** — semantic-release's push-to-release model matches the Gastown/Kilo workflow where poles push and releases happen automatically.
2. **Flexibility** — Plugin ecosystem supports custom release steps (Discord notifications, deployment triggers, custom version badges).
3. **Prerelease channels** — `next` and `beta` branches enable testing releases before production.
4. **Backward compatible** — Existing CHANGELOG.md and git tags are preserved.
5. **Bun compatible** — Works with Bun via `@semantic-release/npm` with `npmPublish: false`.

### 7.2 Recommended Configuration Summary

```
.releaserc.json          → Commit analyzer + changelog + git + github plugins
.github/workflows/       → semantic-release.yml with typecheck/lint/test gates
commitlint.config.js     → Keep as-is (already compatible)
.kilocode/rules/commit.md → Update release workflow documentation
package.json             → Add dry-run scripts
CHANGELOG.md             → Keep as-is (backward compatible)
```

### 7.3 Migration Priority

1. **High**: Create `.releaserc.json` and test workflow on a feature branch with `--dry-run`
2. **High**: Create GitHub Actions workflow
3. **Medium**: Update agent documentation
4. **Medium**: Remove Release Please files
5. **Low**: Add custom plugins (version badge, Discord notifications)
6. **Future**: Evaluate LLM-assisted release summaries

---

## Appendix A: Quick Reference — Type to Version Mapping

| Commit Type | semantic-release Default | Custom Rule (our config) |
|---|---|---|
| `feat` | MINOR | MINOR |
| `feat!` / BREAKING CHANGE | MAJOR | MAJOR |
| `fix` | PATCH | PATCH |
| `perf` | PATCH | MINOR (performance is user-facing) |
| `refactor` | No release | PATCH |
| `docs` | No release | PATCH |
| `style` | No release | PATCH |
| `test` | No release | PATCH |
| `build` | No release | PATCH |
| `ci` | No release | PATCH |
| `chore` | No release | PATCH (hidden from changelog) |

---

## Appendix B: Complete File List for Migration

| File | Action |
|---|---|
| `.releaserc.json` | **CREATE** |
| `.github/workflows/semantic-release.yml` | **CREATE** |
| `.github/workflows/release-please.yml` | **DELETE** |
| `release-please-config.json` | **DELETE** |
| `.release-please-manifest.json` | **DELETE** |
| `.kilocode/rules/commit.md` | **UPDATE** (replace Release Please section) |
| `package.json` | **UPDATE** (add dry-run scripts) |
| `CHANGELOG.md` | **KEEP** (backward compatible) |
| `commitlint.config.js` | **KEEP** (no changes needed) |
| `.husky/pre-commit` | **KEEP** (no changes needed) |
| `.husky/commit-msg` | **KEEP** (no changes needed) |

---

## Appendix C: Dry-Run Testing Commands

Before merging to main, verify the configuration works:

```bash
# Test from a feature branch
bunx semantic-release --dry-run --branches HEAD

# With debug output
bunx semantic-release --dry-run --debug --branches HEAD

# Test specific branch
bunx semantic-release --dry-run --branches main
```

Expected output for a successful dry-run:
```
[semantic-release] › ℹ  Running semantic-release version v24.0.0
[semantic-release] › ✔  Loaded plugin "verifyConditions" from "@semantic-release/commit-analyzer"
[semantic-release] › ℹ  Found git tag v0.5.1
[semantic-release] › ℹ  Analyzing commits...
[semantic-release] › ℹ  The next release version is 0.6.0
[semantic-release] › ℹ  Start step "generateNotes" of plugin "@semantic-release/release-notes-generator"
[semantic-release] › ✔  Generated note for version 0.6.0
```

---

*Document created: 2026-06-05*
*Author: Ember-polecat (Gastown)*
*Convoy: f79efc7b-3386-4b8a-ae32-fec6648c2914*
*Bead: d4a0e08a-b2c6-439c-a053-f76fef759bcb*
