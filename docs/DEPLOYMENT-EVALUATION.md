# Deployment Platform Evaluation — Glaucus App

This document evaluates deployment platforms for the Glaucus app (Next.js 16, React 19, Tailwind CSS 4, SQLite via Drizzle ORM) and documents the recommended deployment strategies, including zero-downtime Blue/Green deployment.

---

## Project Constraints

- **Runtime**: Next.js 16 (App Router) with Bun runtime
- **Output**: Standalone (`output: "standalone"`) compatible for containerization
- **Database**: SQLite via Drizzle ORM (production-ready with read replicas; PostgreSQL-ready via Drizzle adapter)
- **Static assets**: Tailwind CSS 4 (CSS-first), system fonts, optimized images via `next/image`
- **Server-side**: API routes, Server Actions, server components
- **Auth**: Anonymous UUID session → Battle.net OAuth upgrade path
- **Third-party**: Tesseract.js (lazy-loaded, ~2MB), Stripe.js (on-demand), LLM Gateway (streaming)

---

## Platform Evaluations

### 1. Vercel

**Overview**: Creator of Next.js; first-class support for all Next.js features.

| Aspect             | Assessment                                                                 |
| ------------------ | -------------------------------------------------------------------------- |
| Next.js support    | Native — App Router, Server Components, Server Actions all work out of box |
| Edge Functions     | Yes — middleware and edge API routes supported                             |
| Static assets      | Automatic optimization, global CDN, image optimization via `next/image`    |
| Database           | No managed DB; SQLite not ideal on ephemeral filesystem; use external DB   |
| Deployment         | Git push → automatic build → preview → promote to production               |
| Environment vars   | Per-environment (dev/preview/production)                                   |
| Custom domains     | Yes — automatic HTTPS                                                      |
| Pricing            | Free tier (hobby), Pro ($20/mo/seat), Enterprise                           |
| Blue/Green support | **Native** — preview deployments serve as blue, production as green        |

**Pros**: Zero-config Next.js deployment, automatic preview deployments, excellent DX, global CDN, automatic HTTPS, built-in analytics.

**Cons**: SQLite not suitable (ephemeral filesystem requires external database like Neon/Supabase/Turso), vendor lock-in to Vercel's deployment pipeline, serverless cold starts for infrequent routes.

**Verdict**: **Best option** for Next.js projects. Requires migrating SQLite to a managed PostgreSQL or Turso (SQLite edge) for production.

---

### 2. Cloudflare Pages + Workers

**Overview**: Edge-first deployment with global CDN and serverless compute at the edge.

| Aspect             | Assessment                                                                  |
| ------------------ | --------------------------------------------------------------------------- |
| Next.js support    | Via `@cloudflare/next-on-pages` — partial, some App Router features limited |
| Edge Functions     | Yes — Workers runtime at edge locations                                     |
| Static assets      | Excellent — Cloudflare CDN, automatic caching                               |
| Database           | D1 (SQLite-compatible) or Durable Objects for state                         |
| Deployment         | Git push or Wrangler CLI → automatic build                                  |
| Environment vars   | Per-environment                                                             |
| Custom domains     | Yes — automatic HTTPS via Cloudflare                                        |
| Pricing            | Free tier (100k requests/day), Paid ($5/mo + usage)                         |
| Blue/Green support | **Partial** — Workers can route between two Pages deployments               |

**Pros**: Global edge network, D1 provides SQLite-compatible database at edge, generous free tier, Durable Objects for real-time state.

**Cons**: `@cloudflare/next-on-pages` has limited Next.js feature support (no Server Actions, limited middleware), some Node.js APIs unavailable, D1 still in beta, Tesseract.js may not work on Workers runtime (requires wasm/node compat).

**Verdict**: **Viable for static-heavy sites** but not recommended for full Next.js App Router with Server Actions. Good candidate for a future lightweight static frontend if needed.

---

### 3. Railway

**Overview**: Full-stack PaaS with Docker support, managed databases, and simple deployment model.

| Aspect             | Assessment                                                           |
| ------------------ | -------------------------------------------------------------------- |
| Next.js support    | Full — runs as a Node.js/Bun service                                 |
| Edge Functions     | No — standard server deployment                                      |
| Static assets      | Served by the app; can add CDN layer                                 |
| Database           | Managed PostgreSQL, MySQL, Redis — SQLite works on persistent volume |
| Deployment         | Git push or Docker → automatic build and deploy                      |
| Environment vars   | Per-service, per-environment                                         |
| Custom domains     | Yes — automatic HTTPS                                                |
| Pricing            | Trial credits, then pay-as-you-go (compute + DB)                     |
| Blue/Green support | **Manual** — two services + DNS switch required                      |

**Pros**: SQLite works with persistent volume, managed PostgreSQL available, simple Docker-based deployment, good free tier for prototyping, supports Bun runtime.

**Cons**: No native edge network, no built-in CDN (must add Cloudflare separately), manual Blue/Green setup, scaling requires vertical upgrades.

**Verdict**: **Good for self-managed deployments** where SQLite persistence is needed. Best suited for early-stage or small-scale production.

---

### 4. Fly.io

**Overview**: Global edge deployment of Docker containers with built-in volume support and regional fly machines.

| Aspect             | Assessment                                                             |
| ------------------ | ---------------------------------------------------------------------- |
| Next.js support    | Full — runs as a Docker container with Bun runtime                     |
| Edge Functions     | Regional machines deployed close to users                              |
| Static assets      | Served by the app; can add Fly Proxy + CDN layer                       |
| Database           | SQLite on persistent volumes (per-region), or managed Postgres via Fly |
| Deployment         | `fly deploy` → Docker build → rolling deploy across regions            |
| Environment vars   | Secrets per app                                                        |
| Custom domains     | Yes — automatic HTTPS via Let's Encrypt                                |
| Pricing            | Pay-as-you-go (machine hours + volume + bandwidth)                     |
| Blue/Green support | **Native** — multiple app instances with traffic splitting             |

**Pros**: SQLite on persistent volumes works well, regional deployment for low latency, native Blue/Green with multiple machines, Docker-based (full control), supports Bun runtime.

**Cons**: More complex setup than Vercel/Railway, rolling deploys can have brief overlap during machine startup, volume management across regions requires care.

**Verdict**: **Strong option** for SQLite-based deployments with regional requirements. Best for teams comfortable with Docker and infrastructure-as-code.

---

### 5. Self-Hosted (Docker + Nginx/Caddy)

**Overview**: Full control deployment on VPS (Hetzner, DigitalOcean, AWS EC2) with Docker containers and reverse proxy.

| Aspect             | Assessment                                                             |
| ------------------ | ---------------------------------------------------------------------- |
| Next.js support    | Full — runs as a Docker container                                      |
| Edge Functions     | No — standard server deployment                                        |
| Static assets      | Served by reverse proxy (Nginx/Caddy) with caching                     |
| Database           | SQLite on host volume, or managed Postgres/MySQL                       |
| Deployment         | Docker Compose, CI/CD pipeline, manual or automated                    |
| Environment vars   | `.env` files, Docker secrets, or external vault                        |
| Custom domains     | Yes — manual DNS + Let's Encrypt via Caddy/Nginx                       |
| Pricing            | VPS cost ($5-20/mo) + domain + your time                               |
| Blue/Green support | **Full** — Nginx/Caddy config for traffic switching between containers |

**Pros**: Full control, lowest cost at scale, SQLite works natively, complete Blue/Green control via reverse proxy config, no vendor lock-in.

**Cons**: Highest operational overhead, manual HTTPS management, must handle scaling, backups, monitoring, and security yourself.

**Verdict**: **Best for cost control and full autonomy**. Requires DevOps expertise. Ideal when the team has infrastructure experience and wants to avoid vendor lock-in.

---

## Platform Comparison Summary

| Feature                 | Vercel | Cloudflare | Railway   | Fly.io      | Self-Hosted |
| ----------------------- | ------ | ---------- | --------- | ----------- | ----------- |
| Next.js App Router      | ✅     | ⚠️ Partial | ✅        | ✅          | ✅          |
| Server Actions          | ✅     | ❌         | ✅        | ✅          | ✅          |
| SQLite production-ready | ❌     | ⚠️ D1      | ✅        | ✅          | ✅          |
| Edge deployment         | ✅     | ✅         | ❌        | ⚠️ Regional | ❌          |
| Blue/Green (native)     | ✅     | ⚠️ Manual  | ❌ Manual | ✅          | ✅ Manual   |
| CI/CD built-in          | ✅     | ✅         | ✅        | ⚠️ CLI      | ❌          |
| Cost (small scale)      | Free   | Free       | ~$5/mo    | ~$5/mo      | ~$5/mo      |
| Operational overhead    | Low    | Low        | Low       | Medium      | High        |

---

## Recommendation

**Primary recommendation**: **Vercel Pro** for production deployment, with SQLite migrated to **Turso** (edge SQLite) or **Neon** (serverless PostgreSQL via Drizzle adapter).

**Rationale**:

- Zero-config Next.js deployment with full App Router and Server Actions support
- Automatic preview deployments provide a built-in blue/green workflow
- Global CDN and image optimization out of the box
- Lowest operational overhead for a small team
- Drizzle ORM has first-class PostgreSQL adapters — migration from SQLite is straightforward

**Alternative for SQLite-native**: **Fly.io** if keeping SQLite on persistent volumes is a hard requirement. Provides regional deployment, Docker-based control, and native multi-machine Blue/Green support.

**Budget option**: **Railway** for early-stage production with minimal cost and managed PostgreSQL available when ready to migrate off SQLite.

---

## Blue/Green Deployment Strategy

Blue/Green deployment is a zero-downtime release strategy that runs two identical production environments — one active (receiving live traffic) and one idle (receiving the new deployment). Traffic is switched from the active to the idle environment once the new version is verified, enabling instant rollback by switching back.

### Concept

Two environments run in parallel:

- **Blue** — currently serving production traffic
- **Green** — running the new version, receiving no (or minimal) traffic during verification

After the green environment passes health checks and smoke tests, the load balancer switches all traffic from blue to green. Blue becomes the idle standby and the next deployment target.

Key properties:

- **Zero downtime** — traffic is always served by a live environment
- **Instant rollback** — switch back to the previous environment in seconds
- **Safe verification** — test the new version with real traffic before full switch
- **Clean isolation** — old and new versions never run mixed in the same process

### Next.js Compatibility

Blue/Green works naturally with Next.js standalone output:

| Concern             | How It Works                                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Standalone output   | Each environment runs a self-contained Docker container with `.next/standalone`                                                                  |
| Static assets       | `.next/static` is served by the app or reverse proxy; each environment serves its own assets with content-hashed filenames (no stale cache risk) |
| API routes          | Each environment runs its own server — API requests route to whichever environment is active                                                     |
| Server Components   | Server-side rendering happens within each environment independently; no cross-environment state                                                  |
| Middleware          | Each environment runs its own middleware stack; no shared state required                                                                         |
| WebSocket/Streaming | Connections terminate at the active environment; switching drains existing connections gracefully                                                |

**Configuration requirement**: Enable `output: "standalone"` in `next.config.ts` for containerized deployments. Static assets must be served from the same origin or a CDN that supports cache busting via content hashes.

### Database Migration Compatibility

Database migrations are the hardest part of Blue/Green deployment because **both environments may query the same database simultaneously** during the traffic switch window.

#### Expand-Contract Pattern

All migrations must be backward-compatible using a three-phase approach:

1. **Expand** (deploy with blue still active):
   - Add new columns (nullable or with defaults)
   - Create new tables
   - Add new indexes
   - Deploy green with new code that reads/writes both old and new fields

2. **Switch** (traffic moves to green):
   - Green reads and writes the new schema
   - Blue (standby) still uses old fields — harmless since new columns are additive

3. **Contract** (after green is verified and blue is idle):
   - Backfill data from old columns to new columns
   - Remove old columns and tables
   - Deploy a minor update to green that stops using old fields

#### Rules for Backward-Compatible Migrations

- **Never** rename or drop a column in the same deploy that uses the new name
- **Never** change a column type in place — add a new column, backfill, then remove the old
- **Always** add new columns as nullable or with default values
- **Always** make indexes additive (non-blocking in SQLite with careful locking)
- **Use feature flags** in green code to gate behavior on new schema fields until migration is confirmed

#### Feature Flag Strategy

```typescript
// lib/flags.ts
export const flags = {
  useNewGemScoring: process.env.FLAG_NEW_GEM_SCORING === "true",
  useNewResonanceTable: process.env.FLAG_NEW_RESONANCE_TABLE === "true",
};

// Usage in domain code
if (flags.useNewGemScoring) {
  // Read from new_scoring column
} else {
  // Read from legacy scoring calculation
}
```

This allows green to run with the old behavior until the database migration is confirmed complete, then flip the flag without a redeploy.

### Traffic Switching

#### Load Balancer Configuration

**Nginx example**:

```nginx
upstream blue {
    server blue-app:3000;
}

upstream green {
    server green-app:3000;
}

# Active environment — switch by changing upstream reference
upstream production {
    server blue-app:3000;  # Change to green-app:3000 to switch
}

server {
    listen 443 ssl;
    server_name glaucus.app;

    location / {
        proxy_pass http://production;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Caddy example**:

```caddyfile
glaucus.app {
    reverse_proxy @active

    @active {
        header X-Active-Env blue  # Toggle to green via Caddy config reload
    }
}
```

#### DNS Switchover

For deployments without a load balancer, DNS-level switching works but has limitations:

- **TTL dependency** — DNS records have a TTL (typically 300s); clients may cache the old IP
- **Not instant** — some users will hit the old environment during TTL expiration
- **Not recommended** for true zero-downtime — use a load balancer or platform routing instead

#### Gradual Rollout (Canary)

Before a full switch, route a small percentage of traffic to green:

| Phase | Traffic Split        | Duration  | Gate                         |
| ----- | -------------------- | --------- | ---------------------------- |
| 1     | 99% blue / 1% green  | 5-15 min  | No errors in green logs      |
| 2     | 90% blue / 10% green | 15-30 min | Error rate matches blue      |
| 3     | 50% blue / 50% green | 30-60 min | Latency and metrics normal   |
| 4     | 0% blue / 100% green | —         | All checks pass, full switch |

This can be automated via platform traffic-splitting features (Vercel, Fly.io) or load balancer weight configuration (Nginx, AWS ALB).

### Rollback Procedure

Rollback is the primary advantage of Blue/Green deployment:

1. **Detect** — monitoring alerts on error rate, latency, or failed health checks in green
2. **Switch** — change load balancer upstream back to blue (instant, no rebuild needed)
3. **Verify** — confirm blue is serving correctly and error rate returns to baseline
4. **Investigate** — debug green environment offline while blue serves production
5. **Fix** — deploy a corrected green environment
6. **Retry** — repeat traffic switch when the fix is verified

**Rollback time**: < 30 seconds (load balancer config change only)

**Critical**: Do not destroy the blue environment until green has been running stably for at least one full release cycle (e.g., 24 hours or next deploy).

### Platform Feasibility

#### Vercel: Native Support

- **Preview deployments** serve as blue environments — every PR creates an isolated deploy at a unique URL
- **Production** is the green environment
- Promoting a preview to production is the traffic switch
- Instant rollback: re-promote the previous production deployment via the Vercel dashboard or CLI
- **Limitation**: Only one production deployment active at a time; cannot run both simultaneously for canary testing without a custom domain setup
- **Cost**: Included in all plans

#### Cloudflare: Workers Routing Between Pages Deployments

- Two Pages deployments (blue and green) each get a unique `*.pages.dev` URL
- A Cloudflare Worker routes traffic between them based on configuration
- Canary rollout: Worker splits traffic by percentage or cookie
- Rollback: change Worker routing config back to blue URL
- **Limitation**: Worker adds a small latency overhead; Pages functions have limitations vs full Next.js server
- **Cost**: Workers free tier (100k requests/day), then $5/mo + usage

#### Railway: Two Services + Manual DNS Switch

- Deploy blue and green as two separate Railway services
- Each gets a Railway-provided URL
- Switch traffic by updating custom DNS or Railway's domain assignment
- **Limitation**: No native traffic splitting — all-or-nothing DNS switch; manual process
- **Cost**: 2x compute cost during the switch window (~$10-40/mo total)

#### Fly.io: Native Blue/Green with Multiple App Instances

- Deploy two Fly apps (or two machine groups within one app) for blue and green
- Fly Proxy handles traffic routing between instances
- Use `fly scale count` to manage instance counts per environment
- Traffic splitting via Fly's built-in load balancer weights
- Rollback: adjust weights back to blue instances
- **Limitation**: Both environments consume machine hours simultaneously
- **Cost**: 2x machine hours during the switch window

#### Self-Hosted: Nginx/Caddy Config for Traffic Switching

- Run two Docker containers (blue and green) on the same host or different hosts
- Nginx or Caddy reverse proxy routes traffic based on upstream config
- Canary: weighted upstream or cookie-based routing via Lua (Nginx) or Caddy matchers
- Rollback: reload reverse proxy config to point to blue container
- **Limitation**: Requires sufficient host resources for two containers simultaneously
- **Cost**: 2x compute resources during switch window; otherwise just VPS cost

### Cost Implications

Blue/Green deployment doubles infrastructure cost during the deployment window:

| Platform    | Single Env Cost | Blue/Green Window Cost              | Window Duration    | Effective Monthly Overhead     |
| ----------- | --------------- | ----------------------------------- | ------------------ | ------------------------------ |
| Vercel      | $20/mo (Pro)    | Included (preview deploys are free) | Always available   | $0 additional                  |
| Cloudflare  | $0-5/mo         | $0-5/mo (Worker + 2 Pages)          | Always available   | $0-5 additional                |
| Railway     | $5-20/mo        | $10-40/mo (2 services)              | ~30 min per deploy | ~$1-2/mo (at 1-2 deploys/week) |
| Fly.io      | $5-20/mo        | $10-40/mo (2x machines)             | ~30 min per deploy | ~$1-2/mo (at 1-2 deploys/week) |
| Self-hosted | $5-20/mo        | $5-20/mo (same VPS, 2 containers)   | ~30 min per deploy | $0 (if VPS has spare capacity) |

**Key insight**: For platforms that charge by usage (Railway, Fly.io), the cost impact is minimal because the dual-environment window is short (typically 30-60 minutes). The overhead is only significant if you maintain both environments permanently for high-availability failover.

### Recommendation: When Blue/Green Is Worth It

**Use Blue/Green when**:

- Downtime is unacceptable (production users actively using the app)
- You need instant rollback capability (high-risk deployments, schema changes)
- You have sufficient infrastructure budget or platform support (Vercel makes it free)
- You deploy frequently (daily or multiple times per week)
- You have database migrations that benefit from the expand-contract pattern

**Simpler rolling deploys suffice when**:

- Brief downtime (seconds) is acceptable
- You deploy infrequently (weekly or less)
- Your changes are low-risk (content updates, CSS changes, bug fixes)
- Infrastructure budget is tight and platform doesn't support free dual environments
- You are on Vercel (where atomic deploys with instant rollback already provide similar safety)

**For Glaucus specifically**: Vercel's built-in preview-to-production workflow provides effective Blue/Green semantics at no extra cost. For self-hosted or Fly.io deployments, Blue/Green is recommended for major releases and database migrations, but rolling deploys are acceptable for routine bug fixes and content updates.
