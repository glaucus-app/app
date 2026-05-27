# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Rules

- **Package manager**: Use `bun` (not npm/yarn)
- **Never run** `next dev` or `bun dev` - the sandbox handles this automatically
- **Commit workflow**: `bun typecheck && bun lint && git add -A && git commit -m "descriptive message" && git push`

## Commands

| Command | Purpose |
|---------|---------|
| `bun install` | Install dependencies |
| `bun build` | Build production app |
| `bun lint` | Check code quality |
| `bun typecheck` | Type checking |

## Non-Obvious Project Details

- **Tailwind CSS 4**: Uses `@tailwindcss/postcss` plugin (CSS-first configuration, no `tailwind.config.js`)
- **Path alias**: `@/*` maps to `./src/*`
- **No tests configured** - add test framework if needed

## Feature Recipes

When adding features, check the project docs for any recipes or patterns to follow.

## Memory Bank

Update project documentation after completing significant changes.
