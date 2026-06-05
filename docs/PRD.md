# Product Requirements Document (PRD) — Glaucus App

> **Document Status:** Draft
> **Date:** 2026-06-05
> **Project:** Glaucus — Diablo Immortal Gem Optimization Tool
> **References:** `docs/ARCHITECTURE-AUDIT.md`, `docs/TARGET-ARCHITECTURE.md`, `.specify/memory/constitution.md`, `.kilocode/rules/memory-bank/`, `specs/feature/PROJ-001`, `specs/feature/PROJ-002`, `docs/*.csv`, `src/data/gems.json`

---

## 1. Executive Summary

Glaucus is a web-based optimization tool for Diablo Immortal (DI) players, focused initially on legendary gem optimization with a clear architectural path to equipment optimization. The application allows players to maximize resonance, DPS, survivability, and resource ROI with transparent, explainable upgrade guidance.

This PRD defines the complete product experience, bridging the gap between the currently built optimizer UI/workflow foundation and the full vision of a personalized, account-backed character management and optimization platform.

---

## 2. Constitution Alignment

This product strictly adheres to the Glaucus App Constitution (`.specify/memory/constitution.md`):

- **User-First:** Optimization calculations complete in < 5 seconds. Interfaces are mobile-first (touch targets ≥ 44×44px) with a dark theme default (TweakCN).
- **Data Integrity:** Legendary gem stats are sourced from structured database schemas (`src/data/gems.json`, `docs/*.csv`). External validation via diablo.tv for fresh data. User corrections are tracked.
- **Security & Privacy:** Anonymous-first usage. Battle.net OAuth is the primary auth provider. No password storage. Minimal data collection.
- **Transparent Methodology:** All optimization logic is documented. Recommendations display calculated power gain, exact resource cost, and alternative options with trade-offs.
- **Tiered Value:** Free tier provides genuine value (manual entry, greedy algorithm). Paid tiers offer clear, quantifiable upgrades (OCR, advanced algorithms, character sync).

---

## 3. Current State vs. Missing Scope

### 3.1 What Already Exists

- Anonymous sessions and localStorage persistence
- Core gem optimization engine (greedy algorithm)
- Build management (save, list, basic CRUD)
- Responsive UI with TweakCN dark theme
- Static gem database (`src/data/gems.json`)
- Game mechanics reference data (`docs/*.csv`, `docs/legendary-gems/`)

### 3.2 What This PRD Addresses (Missing Scope)

- Public-facing landing page and marketing site
- Authentication flows (Battle.net OAuth, email/password)
- User personal space (dashboard, settings, billing)
- Character management (CRUD, equipment screen, inventory, gems, stats)
- Screenshot OCR for item input
- AI Chat feature ("Chat with your inventory")
- Anonymous-to-authenticated data migration

---

## 4. Critical Design Constraints

1. **Class Data:** DI currently has 9 classes, with a 10th coming next month. `diablo.tv` is the canonical source of truth for fresh class and game data.
2. **Routing Strategy:** Hybrid approach. Path-based routing initially (`/dashboard`, `/characters`, `/settings`, `/billing`), designed to be subdomain-ready later (`user.glaucus.app`).
3. **AI Chat Integration:** Will use Kilo LLM Gateway (`https://kilo.ai/gateway`). The chat feature must be designed around an external LLM API with structured context injection.
4. **Optimizer Scope:** Gems first, equipment later. However, the architecture **must** support equipment optimization as a future extension without requiring a rewrite.
5. **Auth Strategy:** Anonymous first, upgrade later. Users can try basic gem optimization anonymously. Authentication is required to save builds, manage characters, or access paid features.

---

## 5. Product Experience Definition

### 5.1 Public-Facing Site

- **Landing Page:** Hero section with app description, value proposition, and a live, interactive demo preview of the optimization flow.
- **Feature Showcase:** Animated screenshots or interactive demos highlighting the optimization flow, OCR, and character management.
- **Social Proof:** User testimonials, community stats, and Discord integration.
- **Pricing Tiers:**
  - **Free:** Manual gem entry, basic optimization (greedy algorithm), limited selections, anonymous usage.
  - **Paid Tier 1 ($5/mo):** Screenshot OCR, advanced algorithms (dynamic programming), build saving/sharing, ad-free experience.
  - **Paid Tier 2 ($15/mo):** Battle.net character sync, historical tracking, API access, multiple character slots, advanced analytics.
- **FAQ & Trivia:** Diablo Immortal tips, gem guides, and common optimization questions.

### 5.2 User Personal Space

- **User Dashboard:** Overview of owned characters, recent activity, quick actions, and resource summaries.
- **Authentication:** Battle.net OAuth (primary), email/password fallback. Seamless anonymous-to-authenticated migration flow.
- **Settings Page:** Account management, notification preferences, connected accounts, and theme toggles.
- **Billing Page:** Subscription management, payment history, and upgrade/downgrade flows (Stripe integration).

### 5.3 Character Management (Core Workflow)

- **Character List Page:** Grid/list of all characters displaying class icons, gear score, and last activity timestamp.
- **Character Creation:** Select class (from 9 current DI classes, 10th TBD via diablo.tv), select gender (changeable later), and enter character name.
- **Character Detail Page (Tabbed):**
  - **Equipment Screen:** Visual character paper doll showing equipped items by slot.
  - **Gems:** Show all legendary and normal gems currently equipped and available.
  - **Stats:** Derived stats from current build (damage, toughness, life per second, etc.).

### 5.4 Item Input Methods

- **Manual Entry (Free):** Form-based item selection from the internal database, including gem selection with rank/level.
- **Screenshot OCR (Paid Tier 1):** Upload screenshot of equipment or inventory. Tesseract.js processing pipeline with a result review and correction UI before saving.

### 5.5 Build Optimization Engine

- **Playstyle Presets:** User-selectable optimization goals:
  - _PvP:_ Maximum Resonance, Tank/Survival, Balanced
  - _PvE:_ Max DPS, Speed Farming, Challenge Rift Push, Boss Killer
  - _Custom:_ User-defined stat priorities
- **Optimizer Output:** Ranked list of recommended changes with before/after stats, resource cost, and power gain.
- **What-If Scenarios:** Test gear swaps and gem upgrades without committing changes to the saved build.
- **Architecture Note:** The optimizer interface and data models must be designed to support equipment optimization as a future extension (e.g., treating equipment slots similarly to gem slots in the scoring engine).

### 5.6 AI Chat Feature ("Chat with your inventory")

- **Natural Language Queries:** Users can ask questions about builds, items, and optimization.
  - _Examples:_ "Where should I spend my current platinum to maximize my PvP performance?", "What should I focus next: normal or legendary gems?", "I just got a 5/5 legendary gem dropped — is it good for my build? What should I replace?"
- **Context-Aware:** The LLM receives structured context about the user's inventory, current characters, and active builds.
- **Integration:** Kilo LLM Gateway (`https://kilo.ai/gateway`) — external LLM API with strict structured context injection.
- **Guardrails:** The AI must stay within documented game mechanics, avoid speculation, and cite data sources from `docs/*.csv`.

### 5.7 Anonymous-to-Authenticated Migration

- When an anonymous user signs up, their session data (gems, builds, resources) **must** migrate to their new account.
- Zero data loss during the transition.
- Clear UX communicating the migration process and confirming success.

---

## 6. Data Model Overview

| Entity             | Description                      | Key Attributes                                                |
| ------------------ | -------------------------------- | ------------------------------------------------------------- |
| `User`             | Authenticated user account       | `id`, `email`, `authProvider`, `tier`, `createdAt`            |
| `AnonymousSession` | Temporary session state          | `anonymousId`, `sessionState` (JSON), `expiresAt`             |
| `Character`        | User's DI character              | `id`, `userId`, `name`, `class`, `gender`, `gearScore`        |
| `Build`            | Saved optimization configuration | `id`, `userId`/`anonymousId`, `name`, `isPublic`, `createdAt` |
| `BuildEquipment`   | Items equipped in a build        | `buildId`, `slot`, `itemId`, `rank`                           |
| `BuildGem`         | Gems equipped in a build         | `buildId`, `slot`, `gemId`, `rank`, `quality`                 |
| `BuildResource`    | Available resources for a build  | `buildId`, `resourceType`, `quantity`                         |
| `Subscription`     | User's billing status            | `userId`, `tier`, `status`, `currentPeriodEnd`                |

---

## 7. Non-Functional Requirements

- **Performance:** Optimization calculations must complete in < 5 seconds. First Contentful Paint < 1.5s.
- **Mobile Responsiveness:** All interfaces must be fully functional and ergonomic on mobile browsers (for in-game use).
- **Offline Considerations:** Anonymous session state must survive browser refreshes and brief offline periods via localStorage.
- **Accessibility:** WCAG 2.1 AA compliance for all interactive elements.

---

## 8. Out of Scope (Explicitly Deferred)

- **Equipment Optimization Engine:** Will be added in a future milestone. Current architecture must support it, but implementation is out of scope for this PRD.
- **Guild/Clan Management:** Not part of the core optimization loop.
- **Real-time Leaderboards:** Deferred to post-launch.
- **Native Mobile Apps:** Web-first approach only for now.
- **In-game Overlay:** Strictly a web application.

---

## 9. User Journey Maps

### 9.1 Free Tier Journey

1. Lands on homepage → clicks "Try Optimizer" (no login required).
2. Manually enters current gems and available resources.
3. Runs greedy optimization → sees clear before/after stats and resource cost.
4. Saves build locally (anonymous session).
5. Returns later, session is restored. Hits save limit → prompted to create account to save more.

### 9.2 Tier 1 Upgrade Journey

1. Anonymous user hits build limit or wants to use OCR.
2. Clicks "Upgrade" → chooses $5/mo Tier 1.
3. Completes email/password registration (or Battle.net OAuth).
4. **Migration:** Anonymous build is seamlessly attached to the new account.
5. User uploads equipment screenshot → OCR processes → user reviews and corrects → build is saved.

### 9.3 Tier 2 Power User Journey

1. Existing Tier 1 user upgrades to $15/mo for Battle.net sync.
2. Connects Battle.net account → app fetches character list.
3. Selects a character → views auto-populated equipment and gems.
4. Runs advanced optimization → saves multiple "what-if" builds for different activities (e.g., Challenge Rift vs. PvP).
5. Uses AI Chat to ask: "Which of my saved builds is best for today's Cycle of Strife?"

---

## 10. Wireframe-Level Descriptions

- **Landing Page:** Full-width hero with CTA, 3-column feature grid, pricing table (3 columns), FAQ accordion at bottom.
- **Optimizer Page (`/optimize`):** Left panel: Gem selector + Resource inputs. Center: Optimization controls (Playstyle preset dropdown, "Optimize" button). Right panel: Ranked recommendations list with before/after stats.
- **Character Detail (`/characters/[id]`):** Top: Character name, class icon, gear score. Tabs below: [Equipment] [Inventory] [Gems] [Stats]. Equipment tab shows a visual paper doll grid.
- **AI Chat (`/chat`):** Split screen. Left: Context panel showing current character/build summary. Right: Chat interface with message history and input box.

---

## 11. Acceptance Criteria for this PRD

- [x] All core user flows (public site, optimize, builds, tiering) are described.
- [x] Target architecture principles are referenced and consistent with `TARGET-ARCHITECTURE.md`.
- [x] Constitution principles are reflected in tiering and feature gating.
- [x] Game-data sources (`diablo.tv` + `docs/*.csv`) are recognized as canonical inputs.
- [x] Out-of-scope items are listed explicitly.
- [x] PRD aligns with the actually-built code (no phantom features requiring rewrites).
- [x] AI chat design references Kilo LLM Gateway contract.
