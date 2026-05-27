# Glaucus App 🌊

![Glaucus Avatar](public/images/glaucus.png)

[![GitHub](https://img.shields.io/badge/GitHub-glaucus--app-181717?logo=github)](https://github.com/glaucus-app)
[![Domain](https://img.shields.io/badge/Domain-glaucus.app-00a8e8?logo=internet-explorer)](https://glaucus.app)
[![Email](https://img.shields.io/badge/Email-me@glaucus.app-e74c3c?logo=mail.ru)](mailto:me@glaucus.app)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/License-AGPL%203.0+-blue.svg)](https://opensource.org/licenses/AGPL-3.0)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)

[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-green)](https://semver.org/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Keep a Changelog](https://img.shields.io/badge/Keep%20a%20Changelog-1.0.0-orange)](https://keepachangelog.com)
[![Husky](https://img.shields.io/badge/Husky-9.x-purple?logo=git)](https://typicode.github.io/husky/)
[![commitlint](https://img.shields.io/badge/commitlint-19.x-red)](https://commitlint.js.org/)

## Description

Glaucus App is a web application for optimizing legendary gems in Diablo Immortal. Similar to World of Warcraft tools like Raidbots and Ask Mr. Robot, Glaucus helps players make data-driven decisions about gem upgrades to maximize their character's power.

The application analyzes your current gem build, considers available resources (stashed gems, Gem Powder, Platinum, etc.), and provides prioritized upgrade recommendations based on power gain per resource cost.

## Features

- **Gem Inventory**: Upload screenshots or manually select legendary gems from a comprehensive database
- **Resource Management**: Input available resources to get realistic upgrade recommendations
- **Optimization Engine**: Algorithm that factors in resources, current build, and goals to recommend best upgrades
- **Character Sync**: Battle.net OAuth with character verification (planned)
- **Build Management**: Save, share, and compare builds (planned)

### Tiers

- **Free Tier**: Basic optimization, manual gem entry, limited selections
- **Paid Tier 1**: Advanced algorithms, screenshot OCR, build saving/sharing
- **Paid Tier 2**: Battle.net character sync, historical tracking, API access

## Quick Start

### Prerequisites

- Bun runtime (recommended) or Node.js 20+
- Bun is used as the primary package manager

### Installation

```bash
# Clone the repository
git clone git@github.com:glaucus-app/app.git
cd app

# Install dependencies
bun install
```

### Usage

```bash
# Start development server
bun dev

# Build for production
bun build

# Start production server
bun start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing

We welcome contributions! Please follow our commit workflow:

### Commit Workflow

This project uses **Conventional Commits** with automated validation:

```bash
# Type must be one of: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
# Scope is optional but recommended for spec-specific changes

# Examples:
git commit -m "feat: add gem selector component"
git commit -m "fix(optimize): resolve resonance calculation error"
git commit -m "docs: update installation instructions"
```

### Pre-commit Checks

Before each commit, the following checks run automatically:

1. **ESLint** - Code quality and formatting
2. **TypeScript** - Type checking
3. **commitlint** - Commit message format validation

If checks fail:

1. Run `bun lint --fix` to auto-fix formatting issues
2. Fix type errors manually
3. Rewrite commit message following conventional format

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes following conventional commits
3. Create a PR using our template
4. Ensure all CI checks pass
5. Wait for review

### Release Process

This project uses **release-please-action** for automated releases:

1. Commits to `main` trigger a Release PR
2. Review and merge the Release PR
3. GitHub Release is created automatically
4. Version in package.json is bumped automatically

See our [contributing guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the GNU Affero General Public License v3.0 or later - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Raidbots](https://www.raidbots.com/simbot) and [Ask Mr. Robot](https://www.askmrrobot.com/)
- Made with [Kilo Code](https://kilo.ai/)
