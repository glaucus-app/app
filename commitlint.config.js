/**
 * @fileoverview Commitlint configuration for DI-Lab project.
 *
 * This configuration enforces Conventional Commits with comprehensive scopes
 * organized by domain, infrastructure, workflow, and meta categories.
 *
 * SCOPE RESOLUTION: The ambiguous "optimize" scope has been removed.
 * - For performance improvements: Use commit TYPE "perf" (e.g., "perf: optimize render loop")
 * - For gem optimizer feature: Use SCOPE "gems" (e.g., "feat(gems): add greedy algorithm")
 *
 * SUBJECT CASE: Allows multiple case styles for maximum flexibility:
 * - lower-case: Standard for general prose (preferred)
 * - upper-case: For ticket identifiers (e.g., T106, PROJ-002)
 * - camel-case: For variable/function names (e.g., useOptimize)
 * - kebab-case: For file/feature names (e.g., gem-selector)
 * - pascal-case: For component/class names (e.g., GemSelector)
 * - sentence-case: For readable titles (e.g., Add gem selector)
 * - snake-case: For constants/config keys (e.g., GEM_CONFIG)
 * - start-case: For proper nouns (e.g., Battle.net Integration)
 *
 * @see https://conventionalcommits.org/
 * @see https://github.com/conventional-changelog/commitlint
 * @see https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional
 */

/**
 * Valid commit types following Conventional Commits specification.
 * @type {ReadonlyArray<string>}
 */
const COMMIT_TYPES = [
  'build',    // Build system changes
  'chore',    // Maintenance tasks
  'ci',       // CI/CD changes
  'docs',     // Documentation only
  'feat',     // New feature
  'fix',      // Bug fix
  'perf',     // Performance improvement
  'refactor', // Code refactoring
  'revert',   // Revert previous commit
  'style',    // Code style (formatting, whitespace)
  'test',     // Adding/updating tests
];

/**
 * SCOPE CATEGORIES FOR DI-LAB
 *
 * Standard Technical Scopes (industry-standard):
 * - api: API routes, endpoints, server actions, REST/GraphQL interfaces
 *        Example: "feat(api): add optimize endpoint"
 *        Example: "fix(api): validate input schema before processing"
 *
 * - ui: Components, pages, styling, user interface elements
 *       Example: "feat(ui): add gem selector component"
 *       Example: "style(ui): improve mobile responsiveness"
 *
 * - core: Core functionality, shared logic, business rules
 *         Example: "feat(core): add resonance calculation engine"
 *         Example: "fix(core): handle edge case in scoring algorithm"
 *
 * - cli: Command-line interface tools and scripts
 *        Example: "feat(cli): add build validation command"
 *        Example: "fix(cli): correct argument parsing"
 *
 * - config: Configuration files, environment setup, tooling config
 *           Example: "feat(config): add tailwind css 4 configuration"
 *           Example: "fix(config): correct path alias mapping"
 *
 * - deps: Dependencies, package updates, version management
 *         Example: "deps: upgrade next.js to v16"
 *         Example: "fix(deps): pin better-sqlite3 version"
 *
 * - build: Build system, bundling, compilation, production artifacts
 *          Example: "build: optimize production bundle size"
 *          Example: "fix(build): resolve esm module resolution"
 *
 * - ci: Continuous integration, GitHub Actions workflows, pipelines
 *       Example: "ci: add release-please workflow"
 *       Example: "fix(ci): resolve husky hook permissions"
 *
 * - types: TypeScript type definitions, interfaces, type utilities
 *          Example: "feat(types): add Gem optimization types"
 *          Example: "fix(types): correct ResonanceBonus interface"
 *
 * - utils: Utility functions, helpers, shared utilities
 *          Example: "feat(utils): add formatting utilities"
 *          Example: "fix(utils): handle edge case in cn function"
 *
 * Domain Scopes (application-specific):
 * - gems: Legendary gems selection, management, optimization engine
 *         Example: "feat(gems): add greedy optimization algorithm"
 *         Example: "fix(gems): correct resonance calculation for 5-star gems"
 *
 * - auth: Battle.net OAuth, user authentication, character verification
 *         Example: "feat(auth): add Battle.net OAuth provider"
 *         Example: "fix(auth): handle expired session tokens"
 *
 * - db: Database schema, migrations, queries (Drizzle + SQLite)
 *       Example: "feat(db): add legendary_gems table"
 *       Example: "fix(db): correct foreign key constraint"
 *
 * Infrastructure Scopes:
 * - cd: Continuous deployment, release automation
 *       Example: "cd: configure auto-deploy to production"
 *
 * - secrets: Secret management, vault integration, credential rotation
 *            Example: "feat(secrets): add Battle.net OAuth secret rotation"
 *            Example: "fix(secrets): resolve vault token refresh"
 *
 * - env: Environment-specific configurations, stage/prod settings
 *         Example: "feat(env): add production environment variables"
 *         Example: "fix(env): correct staging database URL"
 *
 * Workflow Scopes (GitFlow-inspired):
 * - release: Release preparation, version bumps, changelogs
 *            Example: "release: prepare v0.2.0"
 *            Example: "release: update changelog for v0.1.0"
 *
 * - hotfix: Critical bug fixes requiring immediate deployment
 *           Example: "hotfix: patch auth token validation"
 *
 * Meta Scopes:
 * - specs: Specification documents, planning artifacts
 *          Example: "docs(specs): add optimizer-ui specification"
 *          Example: "feat(specs): create workflow-foundation spec"
 *
 * - docs: Documentation, README, comments (general)
 *         Example: "docs: update installation instructions"
 *
 * @type {ReadonlyArray<string>}
 */
const COMMIT_SCOPES = [
  // Standard Technical Scopes (industry-standard)
  'api',    // API: routes, endpoints, server actions, REST/GraphQL
  'ui',     // User Interface: components, pages, styling
  'core',   // Core: shared logic, business rules, central functionality
  'cli',    // CLI: command-line tools and scripts
  'config', // Configuration: files, environment setup, tooling
  'deps',   // Dependencies: package updates, version management
  'build',  // Build: bundling, compilation, production artifacts
  'ci',     // Continuous Integration: GitHub Actions, workflows
  'types',  // Types: TypeScript definitions, interfaces
  'utils',  // Utilities: helper functions, shared utilities

  // Domain Scopes (application-specific)
  'gems',   // Legendary gems: selection, optimization, management
  'auth',   // Authentication: Battle.net OAuth, character verification
  'db',     // Database: schema, migrations, queries

  // Infrastructure Scopes
  'cd',      // Continuous Deployment: release automation
  'secrets', // Secrets: vault integration, credential rotation
  'security', // Security: CSP, headers, authentication, authorization
  'env',     // Environment: stage/prod configurations

  // Workflow Scopes
  'release', // Release: version bumps, changelog updates
  'hotfix',  // Hotfix: critical bug fixes for immediate deployment

  // Meta Scopes
  'specs',  // Specifications: planning documents, feature specs
  'docs',   // Documentation: README, comments, guides
];

/**
 * Commitlint configuration object.
 * @type {import('@commitlint/types').UserConfig}
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of the conventional commit types
    'type-enum': [2, 'always', COMMIT_TYPES],

    // Scope must be one of the defined project scopes (or empty for global changes)
    'scope-enum': [2, 'always', COMMIT_SCOPES],

    // Subject case: Disable the case check entirely
    // The conventional-commits spec suggests lower-case, but we allow flexibility
    // since commitlint's case validation is too strict for real-world usage
    // (e.g., "add CSP" fails because it's mixed-case)
    'subject-case': [0, 'always', []],

    // Subject must not exceed 72 characters
    'subject-max-length': [2, 'always', 72],

    // Scope-enum is optional (allow empty scope for global changes)
    'scope-empty': [1, 'never'],
  },
};