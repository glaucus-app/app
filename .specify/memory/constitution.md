<!--
Sync Impact Report:
Version change: 1.0.0 → 2.0.0 (major - spec-driven foundation)
Modified principles: Added spec-driven principles as foundation
Added sections: Spec-Driven Foundation, Human-in-the-Loop Validation
Removed sections: N/A
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (reviewed - compatible)
  ✅ .specify/templates/spec-template.md (reviewed - compatible)
  ✅ .specify/templates/tasks-template.md (reviewed - compatible)
Follow-up TODOs: None
-->

# Glaucus App Constitution

## Spec-Driven Foundation

This constitution follows the Specification-Driven Development (SDD) paradigm where **the specification becomes the single source of truth**, and code is generated, validated, and continuously regenerated from that specification.

### Core SDD Principles

1. **The Specification Becomes the System**: Code serves the specification, not the other way around. Specs define the system rather than describing it.

2. **Architecture Becomes Executable**: Architecture and requirements are enforceable via continuous validation and schema checks.

3. **Intent Over Implementation**: Human authority focuses on intent, policy, constraints, and ethics, while automation handles consistent implementation.

4. **Parallelization and Consistency**: Every team member consumes the same precise blueprint, eliminating ambiguity and reducing rework.

5. **AI-Native Development Workflow**: AI coding agents rely on specifications to generate architecture plans, tests, tasks, and code in a deterministic, repeatable way.

### Human-in-the-Loop Validation

**ALL WORKFLOW PHASES REQUIRE EXPLICIT USER APPROVAL BEFORE PROCEEDING.**

This non-negotiable principle prevents:

- Workflow hallucinations where agents assume default behaviors
- Cascading errors from incorrect interpretations
- Specification drift from auto-advancing phases
- Lost customization from skipped optional steps

---

## Domain-Specific Principles

### I. User-First Experience

Every feature MUST prioritize user experience over technical convenience:

- **Fast Results**: Optimization calculations complete in under 5 seconds
- **Clear Output**: Recommendations understandable by casual players without documentation
- **Mobile-First**: All interfaces work seamlessly on mobile browsers for in-game use
- **Progressive Enhancement**: Core functionality works without JavaScript; enhanced with client-side interactivity

**Rationale**: Glaucus App competes with manual calculations and spreadsheets. Speed and clarity are the primary value propositions.

### II. Data Integrity

Gem data MUST be accurate and up-to-date:

- **Single Source of Truth**: Legendary gem stats stored in structured database schema
- **Versioned Data**: Gem stats include game version metadata for auditability
- **External Validation**: DI days and event data sourced from diablo.tv
- **User Corrections**: Users can report data discrepancies; corrections tracked with changelog

**Rationale**: Incorrect optimization recommendations damage user trust irreparably. Data accuracy is non-negotiable.

### III. Security & Privacy

User data handling MUST follow security best practices:

- **OAuth-Only Authentication**: No password storage; Battle.net OAuth as primary auth provider
- **Minimal Data Collection**: Only collect data necessary for core functionality
- **Character Verification**: Mock redemption API validates character ownership before linking
- **No Sensitive Game Data**: Never store Battle.net credentials or sensitive account information

**Rationale**: Security breaches destroy user trust. Follow Battle.net API ToS and Diablo Immortal ToS strictly.

### IV. Transparent Methodology

Optimization algorithms MUST be explainable:

- **Documented Algorithms**: All optimization logic documented in code comments and user-facing docs
- **Power Gain Visibility**: Show calculated power gain for each recommendation
- **Resource Breakdown**: Display exact resource cost for each suggested upgrade
- **Alternative Options**: Present top 3 recommendations with trade-offs explained

**Rationale**: Users need to trust recommendations. Black-box optimization creates skepticism.

### V. Tiered Value

Free tier MUST provide genuine value; paid tiers MUST offer clear upgrades:

- **Free Tier**: Basic optimization (greedy algorithm), manual entry, useful results
- **Paid Tier 1**: Advanced algorithms, OCR, build saving, ad-free
- **Paid Tier 2**: Character sync, history, API access, analytics

**Rationale**: Free users become paid users only if they experience real value first.

## Technical Constraints

### Stack Requirements

| Component       | Technology            | Rationale                        |
| --------------- | --------------------- | -------------------------------- |
| Framework       | Next.js 16 + React 19 | App Router, Server Components    |
| Styling         | Tailwind CSS 4        | Utility-first, mobile-responsive |
| Database        | Drizzle ORM + SQLite  | Type-safe, serverless-compatible |
| Auth            | NextAuth 5            | Battle.net OAuth integration     |
| Validation      | Zod                   | Runtime type safety              |
| Package Manager | Bun                   | Fast installs, native TypeScript |

### Performance Standards

- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 3 seconds
- **Optimization Calculation**: < 5 seconds for 10 gems
- **Lighthouse Score**: > 90 for Performance, Accessibility, Best Practices

### Code Quality Gates

- `bun typecheck` MUST pass before commit
- `bun lint` MUST pass before commit
- All components MUST be Server Components by default
- Client components MUST have explicit `"use client"` directive

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- Feature branches: `feature/<feature-name>`
- Bugfix branches: `fix/<bug-name>`

### Commit Workflow

```bash
bun typecheck && bun lint && git add -A && git commit -m "type: description" && git push
```

Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Code Review Requirements

- All PRs require review before merge
- PRs MUST update memory bank if architecture changes
- Breaking changes MUST be documented in PR description

## Governance

This constitution supersedes all other development practices and decisions:

- **Amendments**: Require documentation, approval, and migration plan
- **Conflicts**: Constitution principles take precedence over convenience
- **Updates**: Increment version using semantic versioning:
  - MAJOR: Principle removal or incompatible changes
  - MINOR: New principles or expanded guidance
  - PATCH: Clarifications, wording fixes

**Version**: 2.0.0 | **Ratified**: 2026-02-13 | **Last Amended**: 2026-02-14

---

## Spec-Kit Workflow Reference

This project uses the [Spec Kit](https://github.com/github/spec-kit) workflow for AI-assisted development:

| Phase        | Command                 | Purpose                           |
| ------------ | ----------------------- | --------------------------------- |
| Constitution | `/speckit.constitution` | Establish foundational principles |
| Specify      | `/speckit.specify`      | Create feature specification      |
| Clarify      | `/speckit.clarify`      | Resolve underspecified areas      |
| Plan         | `/speckit.plan`         | Create implementation plan        |
| Checklist    | `/speckit.checklist`    | Verify requirements completeness  |
| Tasks        | `/speckit.tasks`        | Generate actionable tasks         |
| Analyze      | `/speckit.analyze`      | Cross-artifact consistency check  |
| Implement    | `/speckit.implement`    | Execute implementation            |

### Spec-Kit Directory Structure

```text
.specify/
├── memory/
│   └── constitution.md     # This document
├── scripts/
│   └── bash/               # Automation scripts
├── specs/
│   ├── 000-workflow-foundation/
│   │   └── spec.md         # Feature specs
│   └── README.md           # SDD workflow guide
└── templates/              # Document templates
```
