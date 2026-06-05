# Security Requirements — Glaucus App

> **Date:** 2026-06-05
> **Updated:** 2026-06-05
> **Project:** Diablo Immortal Gem Optimizer (Glaucus)
> **Version:** 1.0.1
> **Classification:** Internal — Engineering Reference

---

## Table of Contents

1. [Threat Model](#1-threat-model)
2. [Authentication Security](#2-authentication-security)
3. [Authorization Model](#3-authorization-model)
4. [API Security](#4-api-security)
5. [Data Protection](#5-data-protection)
6. [Security Headers](#6-security-headers)
7. [Dependency Security](#7-dependency-security)
8. [Incident Response](#8-incident-response)
9. [Compliance](#9-compliance)
10. [Security Checklist](#10-security-checklist)
11. [Penetration Testing Recommendations](#11-penetration-testing-recommendations)

---

## 1. Threat Model

### 1.1 System Context

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Glaucus App                                  │
│                                                                       │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────┐                │
│  │ Browser   │───>│ Next.js 16   │───>│ SQLite /     │                │
│  │ Client    │<───│ Server (API) │<───│ PostgreSQL   │                │
│  └────┬──────┘    └──────┬───────┘    └─────────────┘                │
│       │                  │                                             │
│       │                  ▼                                             │
│       │           ┌──────────────┐                                     │
│       │           │ Battle.net   │  (future OAuth)                     │
│       │           │ Stripe       │  (future payments)                  │
│       │           │ LLM Gateway  │  (future AI chat)                   │
│       │           └──────────────┘                                     │
└───────┼───────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────┐
│  localStorage     │  (anonymous UUID, session state cache)
└───────────────────┘
```

### 1.2 Threat Actors

| Actor                      | Capability                                      | Motivation                                    |
| -------------------------- | ----------------------------------------------- | --------------------------------------------- |
| **Anonymous User**         | Browser-level access, can craft arbitrary UUIDs | Access other users' data, abuse API           |
| **Authenticated User**     | Valid session, own data                         | Escalate privileges, access other users' data |
| **Malicious External**     | Network-level access to public API              | DDoS, injection, data exfiltration            |
| **Compromised Dependency** | Supply chain attack via npm packages            | Backdoor insertion, data theft                |
| **Insider (future admin)** | Database/file system access                     | Data theft, unauthorized access               |

### 1.3 Attack Surface

```
┌──────────────────────────────────────────────────────────┐
│                    Attack Surface                         │
├──────────────────────────────────────────────────────────┤
│ 1. Anonymous UUID Forgery (TD-04) ───────────── HIGH    │
│    Any client can supply arbitrary UUIDs to access       │
│    any session or build. No ownership verification.       │
│                                                           │
│ 2. Cross-Site Request Forgery ────────────────── HIGH    │
│    No CSRF tokens. Mutations via POST accept body-only   │
│    anonymousId, vulnerable to forged cross-origin req.   │
│                                                           │
│ 3. XSS via Build Names/Notes ──────────────────── MED    │
│    sanitizeUserContent() exists but display-side         │
│    sanitization not verified. CSP partially configured.  │
│                                                           │
│ 4. Clickjacking ────────────────────────────────── MED   │
│    X-Frame-Options: ALLOWALL. App can be embedded.       │
│                                                           │
│ 5. API Abuse / No Rate Limiting (TD-10) ──────── HIGH   │
│    No throttling on any endpoint. Optimization engine    │
│    is CPU-intensive; easy to DoS via rapid requests.     │
│                                                           │
│ 6. Session Fixation / No Expiration ───────────── MED    │
│    UUID in localStorage never rotates. Sessions never    │
│    expire. Stale sessions accumulate in database.        │
│                                                           │
│ 7. SQL Injection (Low risk with Drizzle) ──────── LOW   │
│    Drizzle uses parameterized queries, but manual        │
│    query construction could introduce risk.              │
│                                                           │
│ 8. Supply Chain Attack ────────────────────────── MED    │
│    Tesseract.js (7MB+) is a large dependency with        │
│    complex WASM loading chain. Verify integrity.         │
│                                                           │
│ 9. Data Exposure in Errors ────────────────────── MED    │
│    Error responses may leak internal paths, stack        │
│    traces, or database errors to clients.                │
│                                                           │
│10. Insecure Direct Object Reference ──────────── HIGH    │
│    Build IDs are predictable UUIDs. No ownership check   │
│    beyond matching anonymousId query param.              │
└──────────────────────────────────────────────────────────┘
```

### 1.4 Data Flow Security

```
User Browser                    API Route                     Database
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│ localStorage │──anonymousId─>│ validate()?  │──anonymousId─>│ SELECT *     │
│ (UUID)       │<──session────│ rate limit?  │<──query──────│ WHERE id=?   │
│              │  state       │ CSRF check?  │              │              │
│              │              │ own verify?  │              │              │
└──────────────┘              └──────────────┘              └──────────────┘
     │                              │                              │
     ▼                              ▼                              ▼
  XSS accessible              No validation                No encryption
  (localStorage)              on /api/optimize              at rest
```

### 1.5 STRIDE Analysis

| Threat Category            | Affected Component          | Severity | Mitigation                                      |
| -------------------------- | --------------------------- | -------- | ----------------------------------------------- |
| **S**poofing               | Anonymous UUID identity     | HIGH     | Session tokens with rotation, OAuth integration |
| **T**ampering              | Build data, session state   | HIGH     | Zod validation, ownership verification          |
| **R**epudiation            | User actions, build saves   | MED      | Audit logging, authenticated sessions           |
| **I**nformation Disclosure | Error responses, build data | HIGH     | Response sanitization, authorization            |
| **D**enial of Service      | /api/optimize (CPU-heavy)   | HIGH     | Rate limiting, request queuing                  |
| **E**levation of Privilege | Anonymous → authenticated   | HIGH     | Secure migration flow, tier enforcement         |

---

## 2. Authentication Security

### 2.1 Anonymous Session Security

**Current State (RISK: HIGH — TD-04):** Anonymous sessions use a UUID v4 stored in localStorage. The UUID is sent with every API request as the sole authentication mechanism. Any client can supply any UUID.

**Requirements:**

- **UUID Generation:** Use `crypto.randomUUID()` exclusively. No `Math.random()` fallback. Generate server-side on first session creation.
- **Storage:** Anonymous ID stored in an HttpOnly, Secure, SameSite=Strict cookie — NOT localStorage. This prevents XSS from reading the session identifier.
- **Rotation:** Anonymous UUID must rotate every 30 days or upon explicit session invalidation.
- **Binding (future):** Bind sessions to browser fingerprint (user-agent hash + IP subnet) to make UUID guessing insufficient for session hijacking.
- **Creation:** Anonymous sessions created on first page visit via middleware, not client-side JavaScript.

**Implementation:**

```typescript
// Server-side session cookie (not localStorage)
// Cookie attributes:
// - httpOnly: true     (inaccessible to JavaScript)
// - secure: true       (HTTPS only)
// - sameSite: 'strict' (no cross-origin sending)
// - path: '/'          (available to all routes)
// - maxAge: 30 * 24 * 60 * 60 * 1000  (30 days)
```

### 2.2 Anonymous-to-Authenticated Migration

When an anonymous user registers or logs in via Battle.net OAuth, their session data must transfer securely.

**Requirements:**

- **Pre-migration snapshot:** Before auth flow begins, snapshot all anonymous session data (builds, gems, resources) to a temporary migration record.
- **Atomic transfer:** After successful authentication, atomically transfer all data to the authenticated user account. If transfer fails, retain anonymous data for retry.
- **No data loss guarantee:** User must see all their anonymous builds and settings after authentication. Clear UX communication required.
- **Migration record cleanup:** Delete migration records after 24 hours or after successful transfer.
- **Session token upgrade:** Issue a new authenticated session token; invalidate the anonymous session.

**Flow:**

```
1. User clicks "Sign in with Battle.net"
2. Client snapshots localStorage + server session -> POST /api/auth/migrate
3. Server stores snapshot in pending_migrations table
4. OAuth flow proceeds (PKCE)
5. On successful auth, server checks pending_migrations for anonymous ID
6. Server atomically transfers builds, preferences to user account
7. Server issues authenticated session token (HttpOnly cookie)
8. Server deletes anonymous session and migration record
9. Client receives success, refreshes to authenticated view
```

### 2.3 Battle.net OAuth (PKCE Flow)

**Requirements:**

- **PKCE (Proof Key for Code Exchange):** Required for all OAuth flows. Generate `code_verifier` (43-128 chars, URL-safe) client-side, derive `code_challenge` (S256), send with authorization request.
- **State parameter:** Required to prevent CSRF on the OAuth callback. Generate cryptographically random state, store in session cookie, verify on callback.
- **Token storage:** Battle.net access tokens stored server-side only, encrypted at rest. NEVER expose tokens to the browser.
- **Token refresh:** Implement automatic token refresh before expiration (refresh at 80% of TTL). Store refresh tokens encrypted.
- **Scope minimization:** Request only `openid` and profile scopes. Do NOT request scopes for game data unless required for character sync (Tier 2).
- **Callback validation:** Verify `redirect_uri` matches exactly the registered URI. Reject any mismatch.
- **Token validation:** Validate JWT tokens on every request. Check `exp`, `iss`, `aud` claims.

**Environment variables:**

```
BATTLENET_CLIENT_ID=<required>
BATTLENET_CLIENT_SECRET=<required, never committed>
BATTLENET_REGION=us  # or eu, kr, tw
NEXTAUTH_SECRET=<required, generate with openssl rand -base64 32>
NEXTAUTH_URL=https://glaucus.app  # production
```

### 2.4 Session Management

**Requirements:**

| Parameter                   | Value                                              | Rationale                        |
| --------------------------- | -------------------------------------------------- | -------------------------------- |
| Session expiration          | 30 days (authenticated), 7 days (anonymous)        | Balance UX and security          |
| Idle timeout                | 24 hours of inactivity                             | Prevents abandoned session abuse |
| Absolute timeout            | 30 days from creation                              | Forces re-authentication         |
| Concurrent sessions         | 3 per user (free), 10 (tier 1), unlimited (tier 2) | Prevents account sharing         |
| Session fixation protection | New session token on every login                   | Prevents fixation attacks        |
| Secure cookie flags         | HttpOnly, Secure, SameSite=Strict                  | Prevents XSS and CSRF theft      |

**Session lifecycle:**

```
Created ──idle 24h──> Expired ──re-auth──> Refreshed ──30 days──> Expired
   │                                                              │
   └───explicit logout──> Revoked (immediate DB deletion)         │
   └───concurrent limit exceeded──> Oldest session revoked         │
```

### 2.5 CSRF Protection

**Requirements:**

- **Double Submit Cookie Pattern:** Send CSRF token as both a cookie and a request header. Server verifies they match.
- **Token format:** Cryptographically random 32-byte token, base64-encoded.
- **Scope:** Required for ALL mutation endpoints (POST, PATCH, DELETE). Not required for GET.
- **Implementation:**

```typescript
// CSRF middleware applied to all mutation routes
// 1. Generate token, set as cookie (httpOnly: false, needed for JS to read)
// 2. Client reads token, sends as X-CSRF-Token header
// 3. Server compares cookie value to header value
// 4. Reject if missing or mismatched

// SameSite=Strict cookie attribute provides additional CSRF protection
// but double-submit pattern is still required for defense in depth.
```

- **Exemptions:** OAuth callback endpoints, webhook endpoints (Stripe, Battle.net) — these use their own signature verification.

---

## 3. Authorization Model

### 3.1 Resource Ownership

**Principle:** Users can ONLY access their own characters, builds, and session data.

**Requirements:**

- **Ownership column:** Every resource table has `userId` (UUID, FK -> users.id).
- **Ownership verification:** Every API request that reads or writes a resource verifies `userId` matches the authenticated user's ID.
- **Anonymous ownership:** Anonymous sessions use `anonymousId` as ownership key. After migration, anonymous-owned resources transfer to `userId`.
- **Public resources:** Builds can be marked `isPublic: true`. Public builds are readable by anyone but only modifiable by the owner.

**Query pattern (enforced at repository level):**

```typescript
// NEVER: db.select().from(builds).where(eq(builds.id, buildId))
// ALWAYS: db.select().from(builds).where(and(eq(builds.id, buildId), eq(builds.userId, authenticatedUserId)))
```

### 3.2 Tier-Based Access Control

| Feature                   | Free | Tier 1 ($5/mo) | Tier 2 ($15/mo) |
| ------------------------- | ---- | -------------- | --------------- |
| Manual gem entry          | YES  | YES            | YES             |
| Greedy optimization       | YES  | YES            | YES             |
| Saved builds              | 5    | 50             | Unlimited       |
| Screenshot OCR            | NO   | YES            | YES             |
| Advanced algorithms       | NO   | YES            | YES             |
| Battle.net character sync | NO   | NO             | YES             |
| Historical tracking       | NO   | NO             | YES             |
| API access                | NO   | NO             | YES             |
| Build sharing             | NO   | YES            | YES             |
| Analytics dashboard       | NO   | NO             | YES             |
| Concurrent sessions       | 3    | 10             | Unlimited       |

**Implementation:**

- Tier check at the middleware level for protected routes.
- Tier stored in `users.tier` column.
- Tier upgrade/downgrade handled via Stripe webhook.
- Feature gates evaluated server-side, never client-side only.

### 3.3 API Endpoint Authorization Matrix

| Endpoint               | Method   | Anonymous          | Authenticated      | Admin |
| ---------------------- | -------- | ------------------ | ------------------ | ----- |
| `/api/gems`            | GET      | YES                | YES                | YES   |
| `/api/optimize`        | POST     | YES (rate limited) | YES (rate limited) | YES   |
| `/api/session`         | GET      | Own only           | Own only           | NO    |
| `/api/session`         | POST     | Own only           | Own only           | NO    |
| `/api/session`         | DELETE   | Own only           | Own only           | NO    |
| `/api/builds`          | GET      | Own only           | Own only           | NO    |
| `/api/builds`          | POST     | Own only           | Own only           | NO    |
| `/api/builds/:id`      | GET      | Own or public      | Own or public      | YES   |
| `/api/builds/:id`      | PATCH    | Own only           | Own only           | YES   |
| `/api/builds/:id`      | DELETE   | Own only           | Own only           | YES   |
| `/api/auth/battlenet`  | GET/POST | YES                | YES                | YES   |
| `/api/auth/migrate`    | POST     | YES                | NO                 | NO    |
| `/api/billing/*`       | ALL      | NO                 | Own only           | YES   |
| `/api/admin/*`         | ALL      | NO                 | NO                 | YES   |
| `/api/health`          | GET      | YES                | YES                | YES   |
| `/api/webhooks/stripe` | POST     | Signature verified | Signature verified | YES   |

### 3.4 Permission Levels

| Role              | Description                                     | Capabilities                                             |
| ----------------- | ----------------------------------------------- | -------------------------------------------------------- |
| **Anonymous**     | Unregistered user, identified by session cookie | Optimize, manage own anonymous session, 5 builds max     |
| **User (Free)**   | Registered, no paid tier                        | All anonymous + persistent account, 5 builds             |
| **User (Tier 1)** | Dolphin subscriber                              | Free + OCR, advanced algorithms, 50 builds, sharing      |
| **User (Tier 2)** | Whale subscriber                                | Tier 1 + Battle.net sync, history, API access, unlimited |
| **Admin**         | Application administrator                       | View all resources, manage users, access admin endpoints |

**Admin role implementation:**

- Admin flag on `users` table: `isAdmin: boolean, default false`.
- Admin routes protected by separate middleware checking `isAdmin` flag.
- Admin actions logged to audit table.
- No admin UI in the public application — admin access via separate route group or internal tool.

---

## 4. API Security

### 4.1 Rate Limiting Strategy

**Implementation:** Sliding window counter per identifier.

| Endpoint              | Anonymous Limit | Authenticated Limit | Window | Action on Excess                     |
| --------------------- | --------------- | ------------------- | ------ | ------------------------------------ |
| `/api/optimize`       | 10 req / IP     | 30 req / user       | 60s    | 429 + Retry-After header             |
| `/api/builds` (POST)  | 5 req / IP      | 20 req / user       | 60s    | 429 + Retry-After header             |
| `/api/session` (POST) | 30 req / IP     | 60 req / user       | 60s    | 429 + Retry-After header             |
| All GET endpoints     | 60 req / IP     | 120 req / user      | 60s    | 429 + Retry-After header             |
| `/api/auth/*`         | 5 req / IP      | 10 req / user       | 60s    | 429 + account lock after 10 failures |
| `/api/webhooks/*`     | N/A             | 100 req / IP        | 60s    | 429 (verify source IP)               |

**Current scale (SQLite):** In-memory sliding window with per-process counters. Sufficient for < 100 concurrent users.

**Future scale (PostgreSQL + Redis):** Move to Redis-based rate limiting (`INCR` + `EXPIRE` pattern or Redis Time Series).

**Response format on rate limit:**

```json
{
  "error": {
    "type": "rate_limit_exceeded",
    "title": "Too Many Requests",
    "message": "Rate limit exceeded. Please wait before trying again.",
    "retryAfter": 45
  }
}
```

### 4.2 Request Validation

**Requirement: Zod schemas at every external boundary.**

- **All API routes** use `z.safeParse()` for request validation.
- **Validation happens before** any business logic execution.
- **Error responses** include field-level details from Zod's error map.
- **No manual validation** — replace all existing manual `validateRequest()` functions.

**Schema organization:**

```
shared/validation/
├── base-schemas.ts        # UUID, email, pagination, date schemas
└── validators.ts          # withZodValidation() middleware helper

features/<feature>/
├── schemas.ts             # Feature-specific Zod schemas
```

**Validation middleware pattern:**

```typescript
import { withZodValidation } from "@/shared/validation/validators";
import { CreateBuildSchema } from "@/features/builds/schemas";

export const POST = withZodValidation(
  CreateBuildSchema,
  async (request, parsed) => {
    // parsed is typed and validated
    const build = await createBuild(parsed);
    return NextResponse.json({ data: build }, { status: 201 });
  },
);
```

### 4.3 Response Sanitization

**Requirements:**

- **Never expose** internal error details, stack traces, database paths, or SQL queries in production.
- **Error responses** use the standardized format (see TARGET-ARCHITECTURE.md section 5.1).
- **Production mode:** All errors map to generic messages. Internal details logged server-side only.
- **Development mode:** Detailed errors allowed for debugging.
- **PII in responses:** Never include email, user ID, or session data in error responses.
- **Build data sanitization:** `sanitizeUserContent()` applied to all user-provided strings before storage AND before display.

**Error handler pattern:**

```typescript
// Global error handler for API routes
// Production: log full error, return generic message
// Development: return error details
function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.toResponse() },
      { status: error.statusCode },
    );
  }
  console.error("Unhandled API error:", error);
  if (process.env.NODE_ENV === "development") {
    return NextResponse.json(
      {
        error: {
          message: (error as Error).message,
          stack: (error as Error).stack,
        },
      },
      { status: 500 },
    );
  }
  return NextResponse.json(
    {
      error: {
        type: "internal_error",
        message: "An unexpected error occurred.",
      },
    },
    { status: 500 },
  );
}
```

### 4.4 Input Size Limits

| Input Type                     | Limit           | Enforcement                           |
| ------------------------------ | --------------- | ------------------------------------- |
| Request body                   | 1 MB            | Next.js `bodySizeLimit` config        |
| File uploads (OCR)             | 10 MB           | Explicit size check before processing |
| Build name                     | 100 characters  | Zod `max(100)`                        |
| Build notes                    | 5000 characters | Zod `max(5000)`                       |
| Chat message (future)          | 2000 characters | Zod `max(2000)`                       |
| Array fields (gems, resources) | 100 items       | Zod `array().max(100)`                |
| URL parameters                 | 255 characters  | Express/Next.js default               |
| Cookie size                    | 4 KB            | Browser limit (enforced by design)    |

### 4.5 SQL Injection Prevention

**Current risk: LOW** — Drizzle ORM uses parameterized queries exclusively.

**Requirements to maintain:**

- **NEVER** use raw SQL strings with string interpolation.
- **NEVER** use `db.execute()` with user input.
- **ALWAYS** use Drizzle's query builder or prepared statements.
- **Code review check:** Flag any `db.execute(sql` pattern in PRs.
- **If raw SQL is necessary:** Use Drizzle's `sql` tagged template literal, which handles parameterization.

```typescript
// SAFE - Drizzle query builder
const builds = await db.select().from(builds).where(eq(builds.userId, userId));

// SAFE - Drizzle sql template (parameterized)
const result = await db.execute(sql`SELECT * FROM users WHERE id = ${userId}`);

// DANGEROUS - never do this
const result = await db.execute(`SELECT * FROM users WHERE id = '${userId}'`);
```

---

## 5. Data Protection

### 5.1 PII Handling

**PII collected:**

| Data Type                | Source                      | Classification    | Storage                                   | Retention                           |
| ------------------------ | --------------------------- | ----------------- | ----------------------------------------- | ----------------------------------- |
| Email                    | Battle.net OAuth            | PII               | Encrypted at rest                         | Until account deletion + 30 days    |
| Battle.net BattleTag     | OAuth profile               | Public identifier | Plain text                                | Until account deletion              |
| Battle.net access token  | OAuth flow                  | Secret            | Encrypted at rest                         | Until token expires or user revokes |
| Battle.net refresh token | OAuth flow                  | Secret            | Encrypted at rest                         | Until user revokes or logs out      |
| IP address               | Request headers             | PII (GDPR)        | Not stored (rate limiting uses in-memory) | N/A                                 |
| User agent               | Request headers             | PII               | Not stored                                | N/A                                 |
| Game character names     | User input / Battle.net API | Non-PII           | Plain text                                | Until user deletes                  |
| Build data               | User input                  | Non-PII           | Plain text                                | Until user deletes                  |

**Encryption at rest:**

- **SQLite:** Use `sqlcipher` extension for database-level encryption (future). Current SQLite file protected by file system permissions.
- **PostgreSQL (future):** Use `pgcrypto` for column-level encryption of tokens and email. Application-level encryption with AES-256-GCM before storage.
- **Encryption key management:** Keys stored in environment variables, rotated quarterly. NEVER commit keys to version control.

**Encryption in transit:**

- All communication over HTTPS (TLS 1.2+).
- HSTS enforced via security headers (see section 6).
- Internal service-to-service communication (Battle.net, Stripe, LLM Gateway) over HTTPS.

### 5.2 Game Data Classification

**Safe to store:**

- Gem names, stats, effects (public game data)
- Build configurations (gem assignments, resources)
- Character class, name, gear (if synced via Battle.net API with user consent)
- Optimization results and history

**Should NOT store:**

- Battle.net account credentials
- Battle.net session tokens beyond what's needed for API calls
- Payment card numbers (handled entirely by Stripe)
- Other players' personal data
- Chat logs containing personal information beyond the conversation participant

### 5.3 Database Security

**Current (SQLite):**

- Database file at `./data/di-lab.db` — protect with file system permissions (`chmod 600`).
- Directory `./data/` restricted to application process owner.
- Never commit database file to version control (in `.gitignore`).
- SQLite file integrity verified on startup via checksum.

**Future (PostgreSQL):**

- Row-Level Security (RLS) enabled on all user data tables.
- RLS policy example:

```sql
ALTER TABLE saved_builds ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_builds_policy ON saved_builds
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

- Database connection via SSL/TLS.
- Connection pooling with PgBouncer (max 20 connections per app instance).
- Database credentials in environment variables, rotated quarterly.

### 5.4 Backup Strategy

| Backup Type               | Frequency                             | Retention  | Encryption            | Storage                 |
| ------------------------- | ------------------------------------- | ---------- | --------------------- | ----------------------- |
| SQLite database           | Daily (cron)                          | 30 days    | AES-256               | Encrypted cloud storage |
| PostgreSQL                | Continuous WAL archiving + daily full | 90 days    | Built-in + AES-256    | Managed provider        |
| Environment variables     | On change                             | Indefinite | Vault/secrets manager | Infrastructure config   |
| User uploads (OCR images) | Real-time replication                 | 7 days     | Provider encryption   | Cloud storage           |

**Backup verification:**

- Monthly restore test to verify backup integrity.
- Backup checksums verified after each backup operation.
- Alert on backup failure.

**What to back up:**

- Database (all user data, sessions, builds)
- Environment configuration (via secrets manager)
- Custom user uploads (OCR source images, retained 7 days)

**What NOT to back up:**

- Temporary migration records
- Rate limiting counters
- Cache data
- Debug logs

### 5.5 Data Retention

| Data Type                      | Retention Period            | Deletion Trigger                           |
| ------------------------------ | --------------------------- | ------------------------------------------ |
| Anonymous sessions             | 7 days of inactivity        | Inactivity > 7 days or explicit delete     |
| Authenticated sessions         | 30 days of inactivity       | Inactivity > 30 days or logout             |
| Saved builds (active user)     | Indefinite                  | User deletion                              |
| Saved builds (deleted account) | 30 days (grace period)      | Grace period expires                       |
| OAuth tokens                   | Until expiry or revocation  | Token expiry, user logout, or user revokes |
| Chat history (future)          | 90 days                     | User deletion or 90-day expiry             |
| Payment records                | 7 years (legal requirement) | Legal retention period expires             |
| Audit logs                     | 1 year                      | 1-year expiry                              |
| Rate limit counters            | In-memory only              | Process restart                            |
| Error logs                     | 90 days                     | 90-day expiry                              |

**User data deletion (GDPR/CCPA):**

- User can request full data deletion via `/api/account/delete` or account settings.
- Deletion is cascading: user -> sessions -> builds -> associated data.
- Deletion completes within 30 days of request (GDPR requirement: "without undue delay").
- Confirmation email sent when deletion completes.
- Payment records retained per legal requirements even after account deletion (anonymized).

---

## 6. Security Headers

### 6.1 Current State Assessment

| Header                      | Current Value            | Status     | Target                |
| --------------------------- | ------------------------ | ---------- | --------------------- |
| `X-Content-Type-Options`    | `nosniff`                | OK         | Keep                  |
| `X-Frame-Options`           | `ALLOWALL`               | VULNERABLE | `DENY`                |
| `X-XSS-Protection`          | `1; mode=block`          | Deprecated | Remove (CSP replaces) |
| `Content-Security-Policy`   | Via middleware (partial) | INCOMPLETE | See below             |
| `Strict-Transport-Security` | Not set                  | MISSING    | Required              |
| `Referrer-Policy`           | Not set                  | MISSING    | Required              |
| `Permissions-Policy`        | Not set                  | MISSING    | Required              |

### 6.2 Target Security Headers

All headers applied via `next.config.ts` `headers()` function. CSP also set via `middleware.ts` for nonce generation.

```typescript
// next.config.ts - target configuration
const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Prevent clickjacking - no framing allowed
          { key: "X-Frame-Options", value: "DENY" },

          // Force HTTPS
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Control referrer information
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Restrict browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },

          // Remove server identification
          { key: "X-Powered-By", value: "" },
        ],
      },
    ];
  },
};
```

### 6.3 Content-Security-Policy

**Current (middleware.ts):** Partially configured with nonce support. Needs expansion for future integrations.

**Target CSP directives:**

```
default-src 'self'

script-src
  'self'
  'nonce-{nonce}'
  'strict-dynamic'
  https://js.stripe.com          (Stripe.js, future)
  https://*.battle.net           (Battle.net OAuth widgets, if any)

style-src
  'self'
  'unsafe-inline'                (Required for Tailwind CSS 4 runtime)

img-src
  'self'
  blob:
  data:
  https:                          (Gem images, character portraits, Battle.net avatars)

font-src
  'self'                          (System fonts, no external fonts)

connect-src
  'self'
  https://*.battle.net           (Battle.net API, future)
  https://api.stripe.com          (Stripe.js, future)
  https://kilo.ai                 (LLM Gateway, future)
  wss://*.battle.net             (Battle.net WebSocket, if needed)

frame-src
  https://js.stripe.com          (Stripe Elements, future)

frame-ancestors
  'none'                          (No framing — replaces X-Frame-Options: DENY)

base-uri
  'self'

form-action
  'self'

upgrade-insecure-requests         (Force HTTPS for all subresources)
```

**CSP Notes:**

- `'unsafe-inline'` in `style-src` is required for Tailwind CSS 4's runtime style injection. This is acceptable because Tailwind generates styles from the build, not user input.
- `'strict-dynamic'` with nonce allows Next.js production scripts while blocking unauthorized inline scripts.
- Nonce generated per-request in middleware, passed to response headers.
- CSP report-uri for monitoring violations:

```
report-uri /api/csp-report
report-to csp-endpoint
```

### 6.4 Headers Implementation Priority

1. **P0 (Immediate):** `X-Frame-Options: DENY`, `Strict-Transport-Security`, `Referrer-Policy`
2. **P1 (Before auth):** Updated CSP with all future integrations, `Permissions-Policy`
3. **P2 (Before launch):** CSP report monitoring, remove `X-XSS-Protection`

---

## 7. Dependency Security

### 7.1 npm Audit Enforcement

**Requirements:**

- `npm audit` (or `bun audit`) runs in CI on every PR.
- **Critical and High** severity vulnerabilities block the merge.
- Medium vulnerabilities tracked and addressed within 30 days.
- Low vulnerabilities tracked, addressed as maintenance.

**CI configuration:**

```yaml
# .github/workflows/security-audit.yml
- name: Audit dependencies
  run: bun audit --level high
  # Exit code non-zero if high or critical vulnerabilities found
```

### 7.2 Lockfile Verification

**Requirements:**

- `bun.lock` committed to version control.
- `bun install --frozen-lockfile` in CI to verify lockfile consistency.
- Dependabot or Renovate configured for automated dependency updates.
- All dependency updates reviewed manually before merge (especially major versions).

### 7.3 Vulnerability Response Process

| Severity | Response Time | Action                                           |
| -------- | ------------- | ------------------------------------------------ |
| Critical | 24 hours      | Immediate patch or workaround, emergency release |
| High     | 7 days        | Scheduled patch in next release                  |
| Medium   | 30 days       | Added to backlog, addressed in sprint            |
| Low      | 90 days       | Added to backlog                                 |

**Process:**

1. Vulnerability detected (CI audit, user report, or dependency notification)
2. Assess impact on Glaucus app (is the vulnerable code path reachable?)
3. If reachable: create issue, assign severity, set response timeline
4. Patch or update dependency
5. Verify fix, run full test suite
6. Release patched version
7. Update SECURITY-REQUIREMENTS.md if vulnerability reveals a gap

### 7.4 Supply Chain Considerations

**High-risk dependencies:**

| Package               | Risk                                                           | Mitigation                                                                                           |
| --------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `tesseract.js` (7MB+) | Large WASM binary, complex loading chain, external model files | Pin to exact version, verify checksum, lazy-load only when needed, review source code                |
| `next-auth` (beta)    | Beta version, potential breaking changes, security surface     | Monitor release notes, test thoroughly before upgrading, consider stable alternative if issues arise |
| `better-sqlite3`      | Native binary, compiled code                                   | Pin version, verify binary integrity, monitor security advisories                                    |
| `@radix-ui/*`         | Multiple packages, broad UI surface                            | Pin all to exact versions, update together                                                           |

**Supply chain security practices:**

- Pin all dependencies to exact versions in `package.json` (no `^` or `~` for production deps).
- Review `preinstall` and `postinstall` scripts of new dependencies.
- Use `bun install --frozen-lockfile` to prevent lockfile tampering.
- Consider integrity checks for critical dependencies (compare published tarball hash).

---

## 8. Incident Response

### 8.1 What Constitutes a Security Incident

| Category                  | Examples                                             | Severity |
| ------------------------- | ---------------------------------------------------- | -------- |
| **Data Breach**           | User data exposed, database accessed unauthorized    | Critical |
| **Authentication Bypass** | UUID forgery exploited, OAuth flow bypassed          | Critical |
| **Account Takeover**      | User account accessed by unauthorized party          | Critical |
| **XSS Exploitation**      | Malicious script executed in user browser            | High     |
| **CSRF Exploitation**     | Unauthorized action performed on behalf of user      | High     |
| **DDoS**                  | Service degraded or unavailable due to abuse         | High     |
| **Dependency Compromise** | Supply chain attack via npm package                  | Critical |
| **Credential Leak**       | API keys, secrets, or tokens exposed in code or logs | High     |
| **Configuration Error**   | Security headers misconfigured, HTTPS disabled       | Medium   |

### 8.2 Response Process

```
┌─────────┐    ┌──────────┐    ┌────────────┐    ┌───────────┐    ┌──────────┐
│ DETECT   │───>│ CONTAIN  │───>│ INVESTIGATE│───>│ REMEDIATE │───>│  NOTIFY   │
└─────────┘    └──────────┘    └────────────┘    └───────────┘    └──────────┘
     │              │                 │                 │                │
  Monitoring     Isolate           Analyze            Patch            Users,
  User reports   affected          logs,              fix                authorities
  CI alerts      systems           scope                                 if required
```

**1. Detect:**

- Automated monitoring: CI audit failures, error rate spikes, rate limit triggers.
- User reports: Via contact form or responsible disclosure.
- External: Security researcher notification, dependency advisories.

**2. Contain:**

- **Immediate:** Disable affected endpoint, revoke compromised tokens, rotate secrets.
- **Short-term:** Deploy emergency patch, enable enhanced logging.
- **Communication:** Internal team notified within 1 hour of critical incident detection.

**3. Investigate:**

- Preserve all logs and evidence.
- Determine scope: which users, which data, which time period.
- Identify root cause and attack vector.
- Document timeline of events.

**4. Remediate:**

- Patch the vulnerability.
- Rotate all potentially compromised credentials.
- Notify affected users (see notification requirements below).
- Update security controls to prevent recurrence.

**5. Notify:**

| Audience          | Trigger                                 | Timeline        | Method                        |
| ----------------- | --------------------------------------- | --------------- | ----------------------------- |
| Affected users    | Personal data exposed                   | 72 hours (GDPR) | Email + in-app notification   |
| Authorities (DPA) | Personal data breach affecting EU users | 72 hours (GDPR) | Formal report                 |
| Battle.net        | Violation of their API ToS discovered   | 48 hours        | Developer relations contact   |
| Public            | Incident affecting > 100 users          | 7 days          | Blog post, SECURITY.md update |

### 8.3 Responsible Disclosure Policy

**SECURITY.md (public-facing):**

```markdown
# Security Policy

## Reporting a Vulnerability

We take the security of Glaucus seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **DO NOT** open a public GitHub issue.
2. Email us at security@glaucus.app (or the actual contact method) with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Your contact information

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial assessment:** Within 7 days
- **Patch deployed:** Within 30 days (critical: 7 days)
- **Public disclosure:** 90 days after report, or after patch deployment

## Scope

In-scope:

- The Glaucus web application (https://glaucus.app)
- All API endpoints
- Authentication flows
- Data storage and transmission

Out-of-scope:

- Third-party services (Battle.net, Stripe)
- Social engineering attacks
- Physical security
```

### 8.4 Log Retention for Forensic Analysis

| Log Type              | Retention | Format          | Access              |
| --------------------- | --------- | --------------- | ------------------- |
| API access logs       | 90 days   | JSON structured | Engineering team    |
| Authentication events | 1 year    | JSON structured | Engineering + Admin |
| Error logs            | 90 days   | JSON structured | Engineering team    |
| Security audit logs   | 1 year    | JSON structured | Admin only          |
| CSP violation reports | 30 days   | JSON            | Engineering team    |
| Rate limit events     | 7 days    | JSON            | Engineering team    |

**Audit log events (minimum):**

- User login/logout (success and failure)
- Authentication method used
- Session creation and destruction
- Permission changes (tier upgrades, admin grants)
- Build creation, modification, deletion
- Password/token changes (future)
- Data export and deletion requests

---

## 9. Compliance

### 9.1 Battle.net API Terms of Service

**Requirements:**

- **ToS compliance:** Follow Blizzard's Battle.net API Terms of Use strictly. Current ToS available at: https://develop.battle.net/documentation/guides/terms-of-use
- **Rate limits:** Respect Battle.net API rate limits (implementation-specific, typically 100 req/30s per API key).
- **Data usage:** Use Battle.net data ONLY for the purpose of the Glaucus application. Do NOT redistribute, sell, or share Battle.net data.
- **Attribution:** Display "Powered by Battle.net API" or equivalent attribution as required by ToS.
- **Cache policy:** Cache Battle.net data for no longer than ToS allows (typically 24 hours for character data).
- **No credential storage:** NEVER store Battle.net usernames, passwords, or authenticator data.
- **Character verification (TD from constitution):** When linking a Battle.net account to a Glaucus user, verify character ownership via a mock redemption code or similar challenge.
- **ToS change monitoring:** Monitor Battle.net developer portal for ToS changes. Review compliance quarterly.

**Constitution alignment (Section III):**

> "Follow Battle.net API ToS and Diablo Immortal ToS strictly."
> "Never store Battle.net credentials or sensitive account information."

### 9.2 Stripe PCI Compliance

**Responsibility split:**

| Responsibility         | Handled By                        | Notes                                               |
| ---------------------- | --------------------------------- | --------------------------------------------------- |
| Card data collection   | Stripe.js (client-side)           | Card numbers NEVER touch Glaucus servers            |
| Card data transmission | Stripe                            | TLS encrypted, PCI DSS Level 1 certified            |
| Token storage          | Glaucus (Stripe customer ID only) | Token is not card data                              |
| PCI DSS compliance     | Stripe                            | Stripe handles PCI certification                    |
| PCI SAQ-A              | Glaucus                           | Must complete SAQ-A (self-assessment questionnaire) |
| Vulnerability scanning | Glaucus                           | Quarterly external scans required for SAQ-A         |
| Security policy        | Glaucus                           | Must maintain information security policy           |

**Glaucus PCI responsibilities:**

- Use Stripe.js Elements for all card input (iframe-embedded, isolates card data).
- NEVER log, store, or transmit raw card numbers, CVV, or expiry dates.
- Maintain HTTPS for all pages that include Stripe.js.
- Complete PCI SAQ-A annually.
- Ensure no form on the site posts card data to Glaucus servers.
- Review PCI compliance requirements before launching any billing feature.

### 9.3 GDPR Compliance (EU Users)

**Applicability:** Glaucus serves EU users, so GDPR applies.

**Requirements:**

| Requirement                   | Implementation                                                       |
| ----------------------------- | -------------------------------------------------------------------- |
| **Lawful basis**              | Legitimate interest (service delivery) + consent (optional features) |
| **Data minimization**         | Collect only email, BattleTag, game data needed for service          |
| **Right to access**           | `/api/account/export` — download all personal data (JSON format)     |
| **Right to erasure**          | `/api/account/delete` — full account deletion within 30 days         |
| **Right to rectification**    | User can update their profile data via settings page                 |
| **Right to portability**      | Export includes all user data in machine-readable format             |
| **Right to object**           | User can object to processing; results in account deletion           |
| **Consent management**        | Cookie consent banner for non-essential cookies (analytics, etc.)    |
| **Data processing agreement** | Required with any third-party processor (Stripe, hosting provider)   |
| **DPO contact**               | privacy@glaucus.app (or equivalent)                                  |

**Data export format:**

```json
{
  "user": { "id", "email", "tier", "createdAt" },
  "characters": [{ "name", "class", "data" }],
  "builds": [{ "id", "name", "notes", "gems", "resources" }],
  "sessions": [{ "anonymousId", "lastActive" }],
  "paymentHistory": [{ "date", "amount", "tier" }]
}
```

### 9.4 CCPA Compliance (California Users)

**Requirements:**

- **Right to know:** Same data export as GDPR.
- **Right to delete:** Same deletion as GDPR.
- **Right to opt-out of sale:** Glaucus does not sell personal data, but must provide "Do Not Sell My Personal Information" link.
- **Notice at collection:** Privacy policy must list categories of personal data collected and purposes.
- **Non-discrimination:** Cannot penalize users who exercise CCPA rights.

### 9.5 Compliance Checklist

| Regulation         | Status           | Action Items                                         |
| ------------------ | ---------------- | ---------------------------------------------------- |
| Battle.net API ToS | NOT REVIEWED     | Review current ToS, document compliance requirements |
| Stripe PCI SAQ-A   | NOT STARTED      | Complete before launching billing feature            |
| GDPR               | PARTIAL (design) | Implement data export, deletion, consent banner      |
| CCPA               | PARTIAL (design) | Add "Do Not Sell" link, update privacy policy        |
| Cookie consent     | NOT IMPLEMENTED  | Implement before adding analytics/tracking           |

---

## 10. Security Checklist

Use this checklist for EVERY feature before deployment. Check all items that apply.

### 10.1 All Features

- [ ] **Input validation:** All user inputs validated with Zod schemas at API boundary
- [ ] **Output sanitization:** All user-generated content sanitized before storage and display
- [ ] **Error handling:** No internal details leaked in error responses
- [ ] **Authentication:** Feature respects auth requirements (anonymous, user, admin)
- [ ] **Authorization:** Ownership verified for all resource access
- [ ] **Rate limiting:** New endpoints included in rate limiting strategy
- [ ] **Security headers:** Feature works within CSP directives
- [ ] **Secrets:** No secrets in code, env vars only, `.env` in `.gitignore`
- [ ] **Dependencies:** New dependencies audited (`bun audit`), pinned to exact version
- [ ] **Logging:** Security-relevant events logged (auth, access, errors)
- [ ] **Tests:** Security-relevant test cases written and passing

### 10.2 Authentication Features

- [ ] **PKCE:** OAuth flows use PKCE (S256)
- [ ] **State parameter:** OAuth state parameter generated and verified
- [ ] **Token storage:** Tokens stored server-side only, encrypted at rest
- [ ] **Session cookies:** HttpOnly, Secure, SameSite=Strict
- [ ] **CSRF protection:** Mutation endpoints require CSRF token
- [ ] **Session expiration:** Sessions expire per policy
- [ ] **Session fixation:** New token issued on login

### 10.3 API Features

- [ ] **Zod validation:** Request body validated with `z.safeParse()`
- [ ] **Response format:** Standardized error/success response format
- [ ] **Rate limiting:** Endpoint has appropriate rate limit
- [ ] **Ownership check:** Resource access verifies ownership
- [ ] **Input size limits:** Body size, field lengths bounded
- [ ] **No SQL injection:** Drizzle parameterized queries only

### 10.4 Data Features

- [ ] **PII classification:** New data fields classified (PII, secret, public)
- [ ] **Encryption:** Secrets encrypted at rest
- [ ] **Retention:** Data has defined retention period
- [ ] **Deletion cascade:** User deletion cascades to all related data
- [ ] **Export inclusion:** User data export includes new data fields

### 10.5 UI Features

- [ ] **XSS prevention:** No `dangerouslySetInnerHTML` with user content
- [ ] **CSP compliance:** Feature works within CSP (no inline scripts without nonce)
- [ ] **Clickjacking:** Feature not embeddable in iframes (unless intentional)
- [ ] **Client-side auth:** No sensitive data in localStorage
- [ ] **Form security:** Forms include CSRF token

### 10.6 Third-Party Integration

- [ ] **ToS compliance:** Integration complies with provider's ToS
- [ ] **Scope minimization:** Only requested necessary permissions
- [ ] **Error handling:** Graceful degradation if third-party service is down
- [ ] **Secret management:** API keys/secrets in environment variables only
- [ ] **Webhook verification:** Webhook signatures verified (HMAC)

---

## 11. Penetration Testing Recommendations

### 11.1 When to Pen Test

| Trigger                         | Scope                             |
| ------------------------------- | --------------------------------- |
| Before v1.0 launch              | Full application                  |
| After auth implementation       | Auth flows, session management    |
| After billing implementation    | Payment flows, Stripe integration |
| After major architecture change | Affected components + regression  |
| Annually (minimum)              | Full application                  |
| After security incident         | Full application                  |

### 11.2 Recommended Testing Areas

**Authentication & Session:**

1. UUID forgery and session hijacking attempts
2. OAuth PKCE flow manipulation
3. Session token prediction or replay
4. Session fixation attacks
5. Concurrent session limit bypass
6. Anonymous-to-authenticated migration race conditions
7. Token refresh token theft and replay

**Authorization:**

1. Insecure Direct Object Reference (IDOR) — access other users' builds by guessing UUIDs
2. Privilege escalation — anonymous user accessing authenticated-only endpoints
3. Tier bypass — free user accessing paid features
4. Horizontal privilege escalation — user A accessing user B's data
5. Admin endpoint exposure — verify admin routes not accessible to non-admin users

**API Security:**

1. Rate limit bypass — IP spoofing, header manipulation
2. Request smuggling via HTTP/2
3. Mass assignment — injecting unauthorized fields in POST/PATCH bodies
4. Parameter pollution — duplicate parameters with different values
5. JSON injection in request bodies
6. Path traversal via build names or notes
7. WebSocket hijacking (if real-time features added)

**Input Validation:**

1. XSS payloads in build names, notes, character names
2. SQL injection attempts (verify Drizzle protection)
3. Command injection in file names or paths
4. SSRF via URL fields (if any external URL input is accepted)
5. Path traversal in OCR image uploads
6. Zip bomb or decompression bomb in uploaded files

**Data Exposure:**

1. Information leakage in error responses
2. Sensitive data in HTTP headers or cookies
3. Browser caching of sensitive pages
4. Server-side data exposure in source code or comments
5. API responses containing more data than needed (over-fetching)

**Client-Side:**

1. localStorage XSS payload injection
2. Cross-tab session manipulation
3. Service worker hijacking (if added)
4. DOM-based XSS in client-side routing
5. Client-side authorization bypass

### 11.3 Testing Tools

| Tool                        | Purpose                                                      |
| --------------------------- | ------------------------------------------------------------ |
| **OWASP ZAP**               | Automated vulnerability scanner, free                        |
| **Burp Suite Community**    | Manual testing proxy                                         |
| **Burp Suite Professional** | Full automated + manual testing (recommended for engagement) |
| **Nuclei**                  | Template-based vulnerability scanning                        |
| **SQLMap**                  | SQL injection testing (verify Drizzle protection)            |
| **jwt_tool**                | JWT token manipulation testing                               |
| **trufflehog**              | Secret scanning in codebase                                  |
| **semgrep**                 | Static analysis for security patterns                        |

### 11.4 Engaging External Testers

**Before engaging a pentester:**

1. Complete all items in this document's security checklist.
2. Fix all `bun audit` findings.
3. Implement all P0 and P1 security headers.
4. Ensure test environment is isolated from production data.
5. Provide pentester with:
   - This SECURITY-REQUIREMENTS.md document
   - API documentation (endpoint list, request/response schemas)
   - Test account credentials for each tier
   - Known limitations and out-of-scope areas
6. Define rules of engagement:
   - Testing windows (avoid peak hours)
   - Rate limits for testing (or whitelist tester's IP)
   - Data handling requirements for findings
   - Report format and delivery timeline

### 11.5 Post-Test Actions

1. **Review findings:** Categorize by severity and impact.
2. **Create remediation plan:** Timeline and assign owners for each finding.
3. **Fix critical/high findings:** Within 7 days of report.
4. **Verify fixes:** Retest specifically the exploited vectors.
5. **Update this document:** Add any new attack vectors discovered.
6. **Document lessons learned:** Update incident response if needed.
7. **Schedule next test:** Annual minimum, or after major changes.

---

## Appendix A: Related Technical Debt

| TD ID | Security Impact                                          | Priority |
| ----- | -------------------------------------------------------- | -------- |
| TD-04 | No authorization — any UUID accesses any session         | CRITICAL |
| TD-10 | No rate limiting — API abuse possible                    | HIGH     |
| TD-05 | Inconsistent validation — potential bypass gaps          | MEDIUM   |
| TD-16 | Unused next-auth dependency — unnecessary attack surface | LOW      |

## Appendix B: Security-Related Environment Variables

| Variable                  | Purpose                        | Sensitivity | Required For     |
| ------------------------- | ------------------------------ | ----------- | ---------------- |
| `NEXTAUTH_SECRET`         | Session signing key            | CRITICAL    | Auth             |
| `NEXTAUTH_URL`            | Auth callback URL              | Low         | Auth             |
| `BATTLENET_CLIENT_ID`     | OAuth client ID                | Medium      | Auth (future)    |
| `BATTLENET_CLIENT_SECRET` | OAuth client secret            | CRITICAL    | Auth (future)    |
| `STRIPE_SECRET_KEY`       | Stripe API key                 | CRITICAL    | Billing (future) |
| `STRIPE_WEBHOOK_SECRET`   | Webhook signature verification | CRITICAL    | Billing (future) |
| `LLM_GATEWAY_API_KEY`     | LLM API authentication         | CRITICAL    | AI Chat (future) |
| `ENCRYPTION_KEY`          | Database column encryption     | CRITICAL    | Data protection  |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit configuration       | Low         | Rate limiting    |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit configuration       | Low         | Rate limiting    |

## Appendix C: Security-Related CI Checks

| Check            | Tool                      | Failure Threshold              |
| ---------------- | ------------------------- | ------------------------------ |
| Dependency audit | `bun audit --level high`  | Any high/critical              |
| TypeScript check | `bun typecheck`           | Any error                      |
| Linting          | `bun lint`                | Any error                      |
| Secret scanning  | trufflehog (add to CI)    | Any secret found               |
| Static analysis  | semgrep (add to CI)       | Any security rule violation    |
| CSP report       | Monitor `/api/csp-report` | Alert on violation count spike |
