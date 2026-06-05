# Tech Stack Security Audit

**Date:** 2026-06-05
**Auditor:** Maple (Gastown Polecat)
**Scope:** All production and development dependencies, GitHub Actions workflows
**Period:** April–June 2026

---

## 1. Vulnerability Scan Results (`bun audit`)

**Total vulnerabilities: 55** (1 critical, 28 high, 23 moderate, 3 low)

### Critical (1)

| Package | Severity | Advisory | Description |
|---------|----------|----------|-------------|
| vitest <4.1.0 | **Critical** | GHSA-5xrq-8626-4rwp | Arbitrary file read and execution via Vitest UI server |

**Fix:** Upgrade vitest to >=4.1.0. Current: ^4.0.18

### High (28)

| Package | Severity | Advisory | Description |
|---------|----------|----------|-------------|
| drizzle-orm <0.45.2 | High | GHSA-gpj5-g38j-94v9 (CVE-2026-39356) | SQL injection via improperly escaped SQL identifiers |
| next >=16.0.0 <16.2.5 | High | GHSA-8h8q-6873-q5fj | DoS with Server Components (CVE-2026-23870) |
| next >=16.0.0 <16.2.5 | High | GHSA-26hh-7cqf-hhc6 | Middleware/Proxy bypass via segment-prefetch routes (incomplete fix) |
| next >=16.0.0 <16.2.5 | High | GHSA-mg66-mrh9-m8jx | DoS via connection exhaustion (Cache Components) |
| next >=16.0.0 <16.2.5 | High | GHSA-492v-c6pp-mqqv (CVE-2026-44574) | Middleware/Proxy bypass via dynamic route parameter injection |
| next >=16.0.0 <16.2.5 | High | GHSA-c4j6-fc7j-m34r (CVE-2026-44578) | SSRF via WebSocket upgrades |
| next >=16.0.0 <16.2.5 | High | GHSA-267c-6grr-h53f | Middleware/Proxy bypass via segment-prefetch routes |
| next >=16.0.0 <16.2.5 | High | GHSA-36qx-fr4f-26g5 | Middleware/Proxy bypass in Pages Router with i18n |
| next >=16.0.0 <16.2.5 | High | GHSA-q4gf-8mx6-v5v3 | DoS with Server Components |
| next >=16.0.0 <16.2.5 | High | GHSA-h25m-26qc-wcjf | DoS via HTTP request deserialization (insecure RSC) |
| minimatch <3.1.3 | High | GHSA-3ppc-4f35-3m26 | ReDoS via repeated wildcards |
| minimatch <3.1.3 | High | GHSA-7r86-cg39-jmmj | ReDoS via non-adjacent GLOBSTAR segments |
| minimatch <3.1.3 | High | GHSA-23c5-xmqv-rm74 | ReDoS via nested extglobs |
| vite >=7.0.0 <=7.3.1 | High | GHSA-v2wj-q39q-566r | `server.fs.deny` bypassed with queries |
| vite >=7.0.0 <=7.3.1 | High | GHSA-p9ff-h696-f583 | Arbitrary file read via Vite Dev Server WebSocket |
| undici >=7.0.0 <7.24.0 | High | GHSA-f269-vfmq-vjvj | Malicious WebSocket 64-bit length overflows |
| undici >=7.0.0 <7.24.0 | High | GHSA-vrm6-8vpv-qv8q | Unbounded memory consumption in WebSocket permessage-deflate |
| undici >=7.0.0 <7.24.0 | High | GHSA-v9p9-8vph-74h6 | Unhandled exception in WebSocket client |
| rollup >=4.0.0 <4.59.0 | High | GHSA-mw96-cpmx-2vgc | Arbitrary file write via path traversal |
| flatted <3.4.0 | High | GHSA-25h7-pfq9-p65f | Unbounded recursion DoS in parse() |
| flatted <3.4.0 | High | GHSA-rf6f-7fwh-wjgh | Prototype pollution via parse() |
| fast-uri <=3.1.1 | High | GHSA-v39h-62p7-jpjc | Host confusion via percent-encoded authority |
| fast-uri <=3.1.1 | High | GHSA-q3j6-qgpj-74h6 | Path traversal via percent-encoded dot segments |
| picomatch <2.3.2 | High | GHSA-c2c7-rcm5-vvqj | ReDoS via extglob quantifiers |

### Moderate (23)

| Package | Severity | Advisory | Description |
|---------|----------|----------|-------------|
| ajv <6.14.0 | Moderate | GHSA-2g4f-4pwh-qvx6 | ReDoS when using `$data` option |
| brace-expansion <1.1.13 | Moderate | GHSA-f886-m6hf-6m8v | Zero-step sequence causes process hang |
| esbuild <=0.24.2 | Moderate | GHSA-67mh-4wv8-2f99 | Any website can send requests to dev server |
| next >=16.0.0 <16.2.5 | Moderate | GHSA-ffhc-5mcf-pf4q (CVE-2026-44581) | XSS via CSP nonces in App Router |
| next >=16.0.0 <16.2.5 | Moderate | GHSA-gx5p-jg67-6x7h | XSS in beforeInteractive scripts |
| next >=16.0.0 <16.2.5 | Moderate | GHSA-h64f-5h5j-jqjh | DoS in Image Optimization API |
| next >=16.0.0 <16.2.5 | Moderate | GHSA-wfc6-r584-vfw7 | Cache poisoning in RSC responses |
| next >=16.0.0 <16.2.5 | Moderate | GHSA-9g9p-9gw9-jx7f | DoS via Image Optimizer remotePatterns |
| next >=16.0.0 <16.2.5 | Moderate | GHSA-h27x-g6w4-24gq | Unbounded postponed resume buffering DoS |
| next >=16.0.0 <16.2.5 | Moderate | GHSA-mq59-m269-xvcx | Null origin can bypass Server Actions CSRF |
| next >=16.0.0 <16.2.5 | Moderate | GHSA-5f7q-jp6f-vr4g | Unbounded memory consumption via PPR Resume |
| next >=16.0.0 <16.2.5 | Moderate | GHSA-ggv3-7p47-pfv8 | HTTP request smuggling in rewrites |
| next >=16.0.0 <16.2.5 | Moderate | GHSA-3x4c-7xq6-9pq8 | Unbounded next/image disk cache growth |
| postcss <8.5.10 | Moderate | GHSA-qx2v-qp2m-jg93 | XSS via unescaped `</style>` in CSS stringify |
| picomatch <2.3.2 | Moderate | GHSA-3v7f-55p6-f55p | Method injection in POSIX character classes |
| undici >=7.0.0 <7.24.0 | Moderate | GHSA-2mjp-6q6p-2qxm | HTTP request/response smuggling |
| undici >=7.0.0 <7.24.0 | Moderate | GHSA-4992-7rv2-5pvq | CRLF injection via `upgrade` option |
| undici >=7.0.0 <7.24.0 | Moderate | GHSA-phc3-f8pg-7m6h | Unbounded memory consumption in DeduplicationHandler |
| yaml >=2.0.0 <2.8.3 | Moderate | GHSA-48c2-rrv3-qjmp | Stack overflow via deeply nested YAML collections |

### Low (3)

| Package | Severity | Advisory | Description |
|---------|----------|----------|-------------|
| next >=16.0.0 <16.2.5 | Low | GHSA-3g8h-86w9-wvmq | Middleware/Proxy redirects can be cache-poisoned |
| next >=16.0.0 <16.2.5 | Low | GHSA-vfv6-92ff-j949 | Cache poisoning via RSC cache-busting collisions |
| next >=16.0.0 <16.2.5 | Low | GHSA-jcc7-9wpm-mj36 | Null origin can bypass dev HMR websocket CSRF |

---

## 2. CVE Summary Per Dependency

### Next.js (current: ^16.1.3 → patch: 16.2.6)

Next.js 16.1.3 is affected by **16+ security advisories** disclosed in the May 2026 coordinated security release. This is the single most urgent direct dependency to upgrade.

| CVE | GHSA | Severity | Description |
|-----|------|----------|-------------|
| CVE-2026-23870 | GHSA-8h8q-6873-q5fj | High | DoS via Server Components |
| CVE-2026-44574 | GHSA-492v-c6pp-mqqv | High | Middleware bypass via dynamic route injection |
| CVE-2026-44578 | GHSA-c4j6-fc7j-m34r | High | SSRF via WebSocket upgrades |
| CVE-2026-44581 | GHSA-ffhc-5mcf-pf4q | Moderate | XSS via CSP nonces |
| — | GHSA-267c-6grr-h53f | High | Middleware bypass via segment-prefetch |
| — | GHSA-26hh-7cqf-hhc6 | High | Middleware bypass incomplete fix follow-up |
| — | GHSA-mg66-mrh9-m8jx | High | DoS via connection exhaustion |
| — | GHSA-36qx-fr4f-26g5 | High | Middleware bypass in Pages Router i18n |
| — | GHSA-q4gf-8mx6-v5v3 | High | DoS with Server Components |
| — | GHSA-h25m-26qc-wcjf | High | DoS via HTTP deserialization (insecure RSC) |

**Patch:** Upgrade to `next@16.2.6` (released May 7, 2026).

### React/React-DOM (current: ^19.2.3 → patch: 19.2.6)

React 19.2.3 is affected by the upstream RSC DoS vulnerability (CVE-2026-23870). Next.js 16.2.6 bundles the patched RSC dependency, so upgrading Next.js resolves this. If using `react-server-dom-*` directly, upgrade to `19.2.6`.

**Patch:** Upgrade to `react@^19.2.6` and `react-dom@^19.2.6` (or rely on Next.js 16.2.6 bundling).

### Drizzle ORM (current: ^0.45.1 → patch: 0.45.2)

**CVE-2026-39356** (GHSA-gpj5-g38j-94v9) — SQL injection via improperly escaped SQL identifiers in `sql.identifier()`, `.as()`, and `$with()`. Affects PostgreSQL, MySQL, SQLite, SingleStore, and Gel dialects.

- Discovered: March 24, 2026
- Published: April 6, 2026
- Fixed: March 27, 2026 in v0.45.2

**Impact:** Attacker-controlled input to identifier/alias construction can break out of quoted identifiers and inject SQL. Common attack vectors: dynamic sorting, dynamic report builders, CTE names from request parameters.

**Patch:** Upgrade to `drizzle-orm@^0.45.2`.

### better-sqlite3 (current: ^12.6.2 → latest: 12.8.0)

No direct security issues. Health score: 88/100.

**Note:** There was a transitive dependency concern with `prebuild-install` → `tar-stream` → `bl` → `readable-stream`, but `better-sqlite3` maintainer confirmed `undici` is not a transitive dependency of `better-sqlite3` in production installs.

**Recommendation:** Optional upgrade to `12.8.0` for bug fixes.

### Tesseract.js (current: ^7.0.0)

No direct CVEs in `tesseract.js` itself. The related package `node-tesseract-ocr` has a critical CVE-2026-26832 (CVSS 9.8) — OS command injection — but this is a **different package** and does not affect `tesseract.js`.

**Concerns:**
- **Bundle size:** ~15MB WASM + language data downloads at runtime
- **Supply chain:** Downloads language data from external CDN at runtime
- **Performance:** Heavy client-side processing, not suitable for serverless environments

**Recommendation:** Monitor for supply chain risks. Consider alternatives if OCR becomes a paid-tier feature.

### Zod (current: ^4.3.6)

No known security vulnerabilities. Zod v4 is the latest major with no reported validation bypass issues.

**Recommendation:** No action required.

### Radix UI (current: ^1.1.x)

No known security vulnerabilities. Radix UI provides unstyled, accessible primitives. XSS/injection risks are inherited from consuming application code, not the library itself.

**Recommendation:** No action required.

### next-auth (current: ^5.0.0-beta.30)

**Previously fixed:**
- GHSA-5jpx-9hw9-2fx4 — Improper neutralization in email validation (fixed in beta.30, which is the installed version)
- kysely adapter CVE-2026-33468 — SQL injection in kysely adapter (separate PR merged)

**Ongoing concerns:**
- **Still beta after 3+ years** — no stable release planned publicly
- **Adapter bugs** — multiple open issues with `createSession` missing `userId` parameter in email provider + database sessions (#13346, open since Dec 2025)
- **Memory issues** — V5 beta 30 reported to cause machine crashes with certain adapter combinations

**Recommendation:** See Tech Stack Risk Assessment below.

---

## 3. GitHub Actions Security Audit

### Current Workflow: `.github/workflows/release-please.yml`

**Issues found:**

1. **Overly broad top-level permissions** — The workflow declares `contents: write` and `pull-requests: write` at the top level. This is broader than necessary. The `release-please` step needs both, but the `actions/checkout` step only needs `contents: read`.

2. **actions/checkout@v4 uses mutable tag** — Should be pinned to a commit SHA. The tag `@v4` can be moved by the maintainers or compromised. Latest safe SHA: `@11bd71901bbe5b1630ceea73d27597364c9af683` (v4.2.2).

3. **actions/checkout used conditionally after release** — The checkout step runs after `release-please` with full `contents: write` permissions. Should be scoped to `contents: read` only.

4. **No CODEOWNERS on workflows** — No evidence of CODEOWNERS protecting `.github/workflows/`.

5. **No Dependabot for GitHub Actions** — No `dependabot.yml` configuring `github-actions` ecosystem updates.

6. **Node.js 20 deprecation** — GitHub Actions runners will default to Node.js 24 starting June 16, 2026. `actions/checkout@v4` and `release-please-action@v4` should be tested on Node.js 24.

### Recommended Action Pins

| Action | Current | Recommended (SHA-pinned) |
|--------|---------|--------------------------|
| `googleapis/release-please-action` | `@v4` | `@5c625bfb5d1ff62eadeeb3772007f7f66fdcf071` # v4 |
| `actions/checkout` | `@v4` | `@11bd71901bbe5b1630ceea73d27597364c9af683` # v4.2.2 |

### Recommended Workflow Hardening

```yaml
permissions:
  contents: read  # default to read-only for all jobs

jobs:
  release-please:
    permissions:
      contents: write
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@5c625bfb5d1ff62eadeeb3772007f7f66fdcf071 # v4
        id: release
        with:
          manifest-file: .release-please-manifest.json
          config-file: release-please-config.json

      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        if: ${{ steps.release.outputs.release_created }}
        with:
          persist-credentials: false
```

---

## 4. Dependency Upgrade Recommendations

### Critical (upgrade immediately)

| Package | Current | Target | Reason |
|---------|---------|--------|--------|
| vitest | ^4.0.18 | ^4.1.0 | Critical: arbitrary file read/execution via UI server (GHSA-5xrq-8626-4rwp) |
| next | ^16.1.3 | ^16.2.6 | High: 16+ security advisories including DoS, SSRF, middleware bypass, XSS |
| react | ^19.2.3 | ^19.2.6 | High: upstream RSC DoS (CVE-2026-23870) |
| react-dom | ^19.2.3 | ^19.2.6 | High: upstream RSC DoS (CVE-2026-23870) |
| drizzle-orm | ^0.45.1 | ^0.45.2 | High: SQL injection via identifier escaping (CVE-2026-39356) |

### Recommended (should upgrade)

| Package | Current | Target | Reason |
|---------|---------|--------|--------|
| eslint-config-next | ^16.0.0 | ^16.2.6 | Align with Next.js version for compatibility |
| postcss (transitive) | <8.5.10 | >=8.5.10 | XSS via CSS stringify (GHSA-qx2v-qp2m-jg93) |
| vite (transitive) | 7.x | >7.3.1 | Path traversal and file read vulnerabilities |
| rollup (transitive) | <4.59.0 | >=4.59.0 | Arbitrary file write via path traversal |
| esbuild (transitive) | <=0.24.2 | >0.24.2 | Dev server request smuggling |
| undici (transitive) | <7.24.0 | >=7.24.0 | WebSocket overflows, memory consumption, smuggling |
| flatted (transitive) | <3.4.0 | >=3.4.0 | DoS and prototype pollution |
| fast-uri (transitive) | <=3.1.1 | >3.1.1 | URI parsing vulnerabilities |
| picomatch (transitive) | <2.3.2 | >=2.3.2 | ReDoS and method injection |
| minimatch (transitive) | <3.1.3 | >=3.1.3 | Multiple ReDoS vulnerabilities |
| yaml (transitive) | <2.8.3 | >=2.8.3 | Stack overflow via nested collections |
| ajv (transitive) | <6.14.0 | >=6.14.0 | ReDoS with `$data` option |
| brace-expansion (transitive) | <1.1.13 | >=1.1.13 | Process hang and memory exhaustion |

### Optional (nice to have)

| Package | Current | Target | Reason |
|---------|---------|--------|--------|
| better-sqlite3 | ^12.6.2 | ^12.8.0 | Bug fixes and SQLite updates |
| lucide-react | ^0.564.0 | latest | New icons |
| @radix-ui/* | ^1.1.x | latest | Bug fixes, accessibility improvements |
| tailwindcss | ^4.1.17 | latest | Bug fixes |

### Hold (do not upgrade yet)

| Package | Current | Reason |
|---------|---------|--------|
| next-auth | ^5.0.0-beta.30 | No newer beta available. Monitor for stable release. Pin exact version. |
| tesseract.js | ^7.0.0 | Latest version, no vulnerabilities. Monitor supply chain. |
| zod | ^4.3.6 | Latest major, no vulnerabilities. |
| typescript | ^5.9.3 | Stable, no vulnerabilities. |
| playwright | ^1.58.2 | Stable, no vulnerabilities. |
| eslint | ^9.39.1 | Stable, no vulnerabilities. |

---

## 5. Tech Stack Risk Assessment

### next-auth v5 Beta: HIGH RISK

**Status:** Still in beta after 3+ years. No stable release announced.

**Risks:**
- **API instability:** Breaking changes can occur between beta releases without major version bump
- **Adapter bugs:** Open issue #13346 — `createSession` called without `userId` in email provider + database sessions, causing broken authentication. This affects any deployment using magic link / email sign-in with database sessions.
- **Memory issues:** Reported crashes with certain adapter + ORM combinations
- **No deprecation timeline:** v4 is no longer receiving security fixes; v5 is the only maintained path

**Recommendation:**
- Pin to exact version `5.0.0-beta.30` in production (no caret)
- If using email provider with database sessions, test thoroughly or use OAuth-only providers
- Monitor the repository discussions for stable release signals
- Consider evaluating alternatives (Clerk, Supabase Auth, Better Auth) if next-auth remains in beta beyond Q3 2026

### better-sqlite3 vs libsql/Turso: MEDIUM RISK

**Current:** better-sqlite3 with local SQLite file

**Risks:**
- **Not serverless-compatible:** SQLite is a file-based database. It does not work across multiple serverless instances (no shared file system)
- **Stateful deployment required:** Must deploy to a single-instance environment (Vercel Standard, Railway, self-hosted)
- **No horizontal scaling:** Cannot scale beyond one instance without read replicas

**For serverless deployment (Vercel Serverless Functions, Cloudflare Workers):**
- better-sqlite3 **will not work** — each invocation gets a cold file system
- Recommend migrating to libsql/Turso (serverless SQLite-compatible) or PostgreSQL/Drizzle

**Recommendation:**
- If deploying to single-instance (Railway, self-hosted): better-sqlite3 is fine
- If planning serverless deployment: evaluate Turso/libsql now to avoid migration pain later
- Drizzle ORM supports both better-sqlite3 and libsql dialects, making migration easier

### Tesseract.js: LOW-MEDIUM RISK

**Current:** ^7.0.0, client-side WASM-based OCR

**Risks:**
- **Bundle size:** ~15MB WASM binary + language data downloaded at runtime from external CDN
- **Supply chain:** Language data fetched from naptha's CDN (unverified integrity)
- **Performance:** Heavy client-side processing — unsuitable for serverless/edge environments
- **Not node-tesseract-ocr:** The critical CVE-2026-26832 affects a *different* package (`node-tesseract-ocr`), not `tesseract.js`

**Alternatives to consider:**
- **Cloud OCR APIs:** Google Cloud Vision, AWS Textract, Azure Computer Vision (more accurate, paid)
- **Tesseract.js with self-hosted language data:** Configure `workerOptions.workerPath` to use local files
- **Smaller libraries:** None provide comparable browser-based OCR

**Recommendation:**
- Keep Tesseract.js for now but configure self-hosted language data for production
- Add SRI (Subresource Integrity) checks if loading WASM from CDN
- Re-evaluate when OCR becomes a paid-tier feature (Tier 1 per PRD)

### Bun as Runtime: LOW RISK

**Current:** Bun v1.3.x (inferred from audit output)

**Risks:**
- **Smaller security review surface:** Less scrutinized than Node.js, but growing rapidly
- **Compatibility:** Most npm packages work, but edge cases exist with native modules
- **npm audit compatibility:** `bun audit` works and produces comprehensive results (as demonstrated)
- **GitHub Actions:** Node.js 20 EOL in April 2026, runners defaulting to Node.js 24 in June 2026

**Recommendation:**
- No immediate concerns for the current dependency set
- Ensure CI/CD is configured for Bun runtime, not Node.js, to avoid version mismatches
- Monitor Bun security advisories at https://bun.sh/blog

---

## 6. Migration Notes for Breaking Upgrades

### Next.js 16.1.3 → 16.2.6

This is a patch-level security release. No breaking changes expected. The release notes indicate it includes "backported bug fixes" alongside security patches.

**Steps:**
1. `bun update next react react-dom`
2. Run `bun build` to verify
3. Run `bun typecheck` and `bun lint`
4. Test authentication flows (next-auth integration)
5. Test server components rendering
6. Deploy and monitor error rates

### Drizzle ORM 0.45.1 → 0.45.2

Patch release for SQL injection fix. No breaking changes.

**Steps:**
1. `bun update drizzle-orm`
2. Run `bun typecheck`
3. Review any usage of `sql.identifier()`, `.as()`, or `$with()` with user-controlled input
4. Implement allowlists for dynamic identifiers if not already present

### vitest 4.0.18 → 4.1.0

Minor version bump. Review changelog for breaking changes in test runner behavior.

**Steps:**
1. `bun update vitest`
2. Run `bun test:run` to verify all tests pass
3. If Vitest UI is used, ensure it is not exposed in production

---

## 7. Recommended Audit Cadence

### Monthly

- **Run `bun audit` in CI** — add as a scheduled workflow or PR check
- **Review dependency updates** — check `bun outdated` for new versions

```yaml
# .github/workflows/audit.yml
name: Security Audit
on:
  schedule:
    - cron: '0 6 1 * *'  # First of every month at 06:00 UTC
  workflow_dispatch:

permissions:
  contents: read

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun audit
```

### Quarterly

- **Review GitHub Actions versions** — update SHA pins for all actions
- **Evaluate beta dependencies** — assess next-auth v5 stability status
- **Review supply chain risks** — check Socket.dev or Snyk for new package advisories

### Annually

- **Full tech stack review** — evaluate all major dependencies for newer alternatives
- **Penetration testing** — if budget allows, engage external security auditors
- **Dependency pruning** — remove unused dependencies and review bundle sizes

### Immediate Actions (from this audit)

1. Upgrade Next.js, React, React-DOM to patched versions
2. Upgrade Drizzle ORM to 0.45.2
3. Upgrade Vitest to >=4.1.0
4. Pin GitHub Actions to commit SHAs
5. Add `permissions: read-all` to all workflow files
6. Enable Dependabot for `github-actions` ecosystem
7. Add monthly `bun audit` CI workflow
