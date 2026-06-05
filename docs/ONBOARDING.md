# Project Onboarding Guide

> **Template** — Replace all `{{PLACEHOLDER}}` values with project-specific information.

## 1. Prerequisites

### Kilo Account & CLI

1. Create a [Kilo account](https://kilo.ai/)
2. Install the CLI:
   ```bash
   npm install -g @kilocode/cli
   kilo auth login
   ```

### Town & Rig Setup

```bash
# Create a new town (project namespace)
kilo town create "{{PROJECT_NAME}}" --org "{{ORG_NAME}}"

# Connect a git repo as a rig
kilo rig create --town {{TOWN_ID}} \
  --repo {{OWNER}}/{{REPO}} \
  --branch main \
  --provider github
```

### Environment Variables

Set these on your CI provider and rig config before dispatching agents:

| Variable              | Purpose                    | Required |
| --------------------- | -------------------------- | -------- |
| `{{API_KEY_VAR}}`     | LLM / external API access  | Yes      |
| `{{DB_URL_VAR}}`      | Database connection string | Yes      |
| `{{AUTH_SECRET_VAR}}` | Session encryption / OAuth | Yes      |
| `{{OTHER_VAR}}`       | {{DESCRIPTION}}            | No       |

## 2. Initial Rig Setup

### Clone & Verify

```bash
git clone git@github.com:{{OWNER}}/{{REPO}}.git
cd {{REPO}}
bun install
```

### Agent Instructions — `AGENTS.md`

Create `AGENTS.md` at the repo root. This file is read by every agent on dispatch.

```markdown
# AGENTS.md

## Critical Rules

- Package manager: use `{{PKG_MANAGER}}` (e.g. bun, pnpm, npm)
- Never run the dev server — the sandbox handles this
- Commit workflow: `{{PKG_MANAGER}} typecheck && {{PKG_MANAGER}} lint && git add -A && git commit && git push`

## Commands

| Command                     | Purpose              |
| --------------------------- | -------------------- |
| `{{PKG_MANAGER}} install`   | Install dependencies |
| `{{PKG_MANAGER}} build`     | Build                |
| `{{PKG_MANAGER}} lint`      | Lint                 |
| `{{PKG_MANAGER}} typecheck` | Type check           |
| `{{PKG_MANAGER}} test`      | Test                 |
```

### Memory Bank & Rules — `.kilocode/`

```bash
mkdir -p .kilocode/rules/memory-bank
```

Required files in `.kilocode/rules/memory-bank/`:

| File              | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `brief.md`        | Project goals, constraints, success metrics |
| `product.md`      | User personas, flows, why this exists       |
| `architecture.md` | System design, code patterns, conventions   |
| `tech.md`         | Tech stack, dependencies, setup steps       |
| `context.md`      | Current state, recent changes, focus areas  |

Add `memory-bank-instructions.md` at `.kilocode/rules/` to tell agents when and how to update memory files.

### Constitution — `.specify/memory/constitution.md`

The constitution defines non-negotiable principles for spec-driven development:

```bash
mkdir -p .specify/memory
# Create constitution.md following the SDD template
# See .specify/templates/ for reference
```

### Toolchain Configuration

Ensure these config files exist and pass on a fresh clone:

```
{{PKG_MANAGER}}.json / package.json   # scripts & deps
eslint.config.{{ext}}                 # lint rules
tsconfig.json                         # TypeScript config
vitest.config.ts / jest.config.js     # test config
playwright.config.ts                  # e2e test config
```

Verify with:

```bash
{{PKG_MANAGER}} typecheck && {{PKG_MANAGER}} lint && {{PKG_MANAGER}} test
```

## 3. First Work Session

### Talk to the Mayor

The Mayor is the orchestrator. Start by describing the feature or problem in natural language:

> "I want to add {{FEATURE}}. Here's the context: {{CONTEXT}}"

The Mayor will:

1. Create a **convoy** (planning container)
2. Dispatch **polecats** (specialized agents) for spec, implementation, and review
3. Manage the staged workflow

### Staged Convoy Workflow

```
1. /convoy create "Feature name"      → Mayor creates convoy
2. Polecats spec & plan                → Review the plan
3. Approve → dispatch implementation   → Agents write code
4. Review → approve → merge            → PR is created & reviewed
```

### Review & Merge

- Every PR is reviewed by a **refinery** agent
- Approved PRs merge to `main`
- Failed reviews create **fixup beads** for the original agent

## 4. CI/CD Setup

### GitHub Actions

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun typecheck
      - run: bun lint
      - run: bun test
      - run: bun build
```

### Release Automation

| Tool             | Best for                         |
| ---------------- | -------------------------------- |
| Release Please   | Monorepos, conventional commits  |
| semantic-release | Single-package, plugin ecosystem |

```bash
# Release Please (recommended for most projects)
{{PKG_MANAGER}} add -D release-please
# See release-please-config.json
```

### Branch Protection

Enable on `main`:

- Require PR reviews (≥ 1)
- Require status checks to pass
- Block force pushes
- Require signed commits (optional)

## 5. Project Management Integration

### GitHub Issues

Set up labels and templates:

```bash
# Labels
gh label create "bug" --color d73a4a
gh label create "enhancement" --color a2eeef
gh label create "docs" --color 0075ca
```

### Beads ↔ Issues ↔ PRs

| Gastown Concept | GitHub Equivalent  |
| --------------- | ------------------ |
| Bead            | Issue / task       |
| Convoy          | Feature / epic     |
| PR              | Pull request       |
| Fixup bead      | Review comment fix |

### Tracking Progress

View all open convoys and beads:

```bash
kilo convoy list --town {{TOWN_ID}}
kilo bead list --town {{TOWN_ID}}
```

## 6. Documentation Structure

```
docs/
├── ONBOARDING.md            # This file
├── DESIGN.md                # Design system & UI guidelines
├── TESTING-STRATEGY.md      # Test approach & coverage goals
├── SECURITY-REQUIREMENTS.md # Security policy & requirements
└── {{OTHER}}.md             # {{DESCRIPTION}}
```

### Required Root Files

| File              | Audience  | Purpose                       |
| ----------------- | --------- | ----------------------------- |
| `README.md`       | Everyone  | What this is, how to run it   |
| `CONTRIBUTING.md` | Humans    | How to contribute code        |
| `AGENTS.md`       | AI agents | Agent instructions & commands |
| `CHANGELOG.md`    | Users     | Auto-generated from commits   |

## 7. Common Workflows

### Adding a Feature

```
1. Describe feature to Mayor → creates staged convoy
2. Review spec & plan → approve
3. Implementation polecats write code & tests
4. Review agent creates PR
5. Approve → merge to main
```

### Fixing a Bug

```
1. Describe bug to Mayor → creates quick sling
2. Polecat fixes & pushes
3. Review → merge
```

### Database Migrations

```bash
# Drizzle ORM example
{{PKG_MANAGER}} drizzle-kit generate
{{PKG_MANAGER}} drizzle-kit migrate
```

Always commit migration files alongside the code that uses them.

### Adding Integrations

1. Document the integration in `docs/{{INTEGRATION-NAME}}.md`
2. Add credentials as rig environment variables
3. Create a convoy for implementation
4. Include connection tests in CI

## 8. Troubleshooting

### Stuck Agents

```bash
# Nudge an agent (gentle)
kilo agent nudge {{AGENT_ID}} --message "Please check status"

# Reassign a bead
kilo bead reassign {{BEAD_ID}} --agent {{NEW_AGENT_ID}}
```

### Failed Builds

1. Check the PR for refinery feedback
2. Review CI logs: `gh run view {{RUN_ID}} --log-failed`
3. Fix the issue, push, and the fixup bead auto-resolves

### Merge Conflicts

- The convoy system detects conflicts automatically
- A **conflict resolution bead** is dispatched to a polecat
- The polecat rebases onto the target branch and resolves conflicts

### Agent Not Starting

1. Check dispatch count — agents may be rate-limited
2. Verify rig connection and API keys
3. Escalate: `kilo escalate --rig {{RIG_ID}} --message "Agent not dispatching"`

## 9. Best Practices

- **One convoy per feature** — never add unrelated beads to an existing convoy
- **Write detailed bead bodies** — include context, acceptance criteria, and links to relevant docs
- **Use staged convoys for planning** — direct dispatch only for simple, well-understood tasks
- **Update memory bank after every significant change** — `context.md` minimum
- **Keep AGENTS.md current** — outdated instructions cause agent errors
- **Reference issues in commits** — `feat: add {{X}} (#123)`
- **Test before push** — `typecheck && lint && test` is non-negotiable
