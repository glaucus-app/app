# Feature Specifications (FEATURES.md) — Glaucus App

> **Document Status:** Draft
> **Date:** 2026-06-05
> **Input:** `docs/PRD.md`, `.specify/memory/constitution.md`, `docs/TARGET-ARCHITECTURE.md`
> **Purpose:** Break the PRD into concrete, implementable features for independent development by AI agents (poles).

---

## Feature Specification Format

Each feature below includes:

- **ID & Name:** Unique identifier and title.
- **Description & User Stories:** What the feature does and who it serves.
- **Acceptance Criteria:** Given/When/Then format.
- **Technical Considerations:** API endpoints, components, data models, Server/Client designation.
- **Tier Gating:** Free / Tier 1 ($5/mo) / Tier 2 ($15/mo).
- **Dependencies:** Prerequisite features.
- **Test Requirements:** Expected test coverage and types.

---

## Group A: Foundation & Auth

### F01: User Registration and Authentication

- **Description:** Enable users to create accounts and log in securely.
- **User Stories:**
  - As a user, I want to log in with my Battle.net account so I don't have to remember another password.
  - As a user, I want to register with email/password as a fallback.
- **Acceptance Criteria:**
  - Given I am on the sign-in page, when I click "Login with Battle.net", then I am redirected to Battle.net OAuth and returned to the app with a valid session.
  - Given I am an anonymous user with saved data, when I complete registration, then my anonymous session data is migrated to my new account without loss.
- **Technical Considerations:**
  - **Data Model:** New `users` table (`id`, `email`, `authProvider`, `providerId`, `tier`, `createdAt`).
  - **API Routes:** `POST /api/auth/signin`, `POST /api/auth/signout`, `GET /api/auth/session`.
  - **Components:** `LoginModal` (Client), `AuthProvider` (Client).
  - **Server/Client:** Auth providers are Server-side; modals are Client components.
- **Tier Gating:** Free (basic auth), required for Tier 1/2 features.
- **Dependencies:** None.
- **Test Requirements:** Unit tests for auth utilities, integration tests for OAuth flow mocking, E2E test for anonymous-to-auth migration.

### F02: User Profile and Account Management

- **Description:** Allow users to view and manage their account details.
- **User Stories:**
  - As a user, I want to view my current subscription tier and connected accounts.
- **Acceptance Criteria:**
  - Given I am logged in, when I visit `/settings/profile`, then I see my email, auth provider, and tier.
- **Technical Considerations:**
  - **Data Model:** Read from `users` table.
  - **API Routes:** `GET /api/users/me`, `PATCH /api/users/me`.
  - **Components:** `ProfileForm` (Client), `ConnectedAccounts` (Client).
- **Tier Gating:** Free.
- **Dependencies:** F01.
- **Test Requirements:** Unit tests for profile update validation, integration tests for `GET /api/users/me`.

### F03: Subscription and Billing Management

- **Description:** Handle Stripe integration for paid tiers.
- **User Stories:**
  - As a user, I want to upgrade my account to Tier 1 to unlock OCR features.
- **Acceptance Criteria:**
  - Given I am on the billing page, when I click "Upgrade to Tier 1", then I am redirected to Stripe Checkout, and upon success, my user tier is updated.
    are updated.
- **Technical Considerations:**
  - **Data Model:** New `subscriptions` table (`id`, `userId`, `stripeCustomerId`, `stripeSubscriptionId`, `tier`, `status`, `currentPeriodEnd`).
  - **API Routes:** `POST /api/billing/create-checkout-session`, `POST /api/billing/webhook` (Stripe events).
  - **Components:** `PricingTable` (Client), `BillingPortalButton` (Client).
- **Tier Gating:** Tier 1, Tier 2.
- **Dependencies:** F01, F02.
- **Test Requirements:** Unit tests for webhook signature verification, integration tests for checkout session creation.

### F04: User Personal Space Routing and Navigation Shell

- **Description:** Provide the layout and navigation for authenticated users.
- **User Stories:**
  - As a user, I want a consistent navigation bar to access my characters, builds, and settings.
- **Acceptance Criteria:**
  - Given I am logged in, when I navigate to `/dashboard`, then I see a sidebar with links to Characters, Builds, Settings, and Billing.
- **Technical Considerations:**
  - **Components:** `AppLayout` (Server), `SidebarNav` (Client), `MobileNav` (Client).
  - **Server/Client:** Layout is Server; interactive nav items are Client.
- **Tier Gating:** Free (basic shell), gated content inside.
- **Dependencies:** F01.
- **Test Requirements:** Component tests for responsive nav rendering, E2E test for navigation flow.

### F05: Settings Page with Preferences

- **Description:** Allow users to configure app preferences.
- **User Stories:**
  - As a user, I want to toggle between light and dark themes (though dark is default).
- **Acceptance Criteria:**
  - Given I am on `/settings`, when I change the theme, then the UI updates immediately and persists across sessions.
- **Technical Considerations:**
  - **Data Model:** Add `preferences` JSON column to `users` table.
  - **API Routes:** `PATCH /api/users/preferences`.
  - **Components:** `SettingsPage` (Server), `ThemeToggle` (Client).
- **Tier Gating:** Free.
- **Dependencies:** F01, F04.
- **Test Requirements:** Component tests for theme toggle, integration tests for preference persistence.

---

## Group B: Character Management

### F06: Character CRUD

- **Description:** Create, read, update, and delete Diablo Immortal characters.
- **User Stories:**
  - As a user, I want to create a new character profile to optimize its gear.
- **Acceptance Criteria:**
  - Given I am on `/characters`, when I click "Add Character", fill in name, class (9 current + 1 TBD), and gender, then the character is saved and appears in the list.
- **Technical Considerations:**
  - **Data Model:** New `characters` table (`id`, `userId`, `name`, `className`, `gender`, `gearScore`, `createdAt`).
  - **API Routes:** `GET /api/characters`, `POST /api/characters`, `PATCH /api/characters/[id]`, `DELETE /api2.
- **Dependencies:** F01, F06.
- **Test Requirements:** Component tests for paper doll rendering, integration tests for equipment updates.

### F08: Character Inventory Management

- **Description:** Manage items owned by the character.
- **User Stories:**
  - As a user, I want to see a list of all items my character owns, with search and filter capabilities.
- **Acceptance Criteria:**
  - Given I am on the Inventory tab, when I type "Azzara" in the search box, then only items matching "Azzara" are displayed.
- **Technical Considerations:**
  - **Data Model:** New `inventory_items` table (`id`, `characterId`, `itemId`, `quantity`, `rank`).
  - **API Routes:** `GET /api/characters/[id]/inventory`, `POST /api/characters/[id]/inventory`.
  - **Components:** `InventoryGrid` (Client), `ItemSearch` (Client), `ItemCard` (Client).
- **Tier Gating:** Free (manual), Tier 1 (OCR populated).
- **Dependencies:** F06, F11, F12.
- **Test Requirements:** Component tests for search/filter logic, integration tests for inventory CRUD.

### F09: Gem Management

- **Description:** Manage legendary and normal gems for a character.
- **User Stories:**
  - As a user, I want to view all gems my character has, both equipped and in the inventory.
- **Acceptance Criteria:**
  - Given I am on the Gems tab, when I view the list, then I see equipped gems highlighted and inventory gems available for selection.
- **Technical Considerations:**
  - **Data Model:** Uses `build_gems` and a new `character_gems` table (`id`, `characterId`, `gemId`, `rank`, `quality`, `isEquipped`).
  - **API Routes:** `GET /api/characters/[id]/gems`, `POST /api/characters/[id]/gems`.
  - **Components:** `GemList` (Client), `GemDetailModal` (Client).
- **Tier Gating:** Free.
- **Dependencies:** F06, F07.
- **Test Requirements:** Unit tests for gem sorting logic, integration tests for gem assignment.

### F10: Character Stats Calculation

- **Description:** Calculate derived stats from current equipment and gems.
- **User Stories:**
  - As a user, I want to see my character's total Damage, Toughness, and Life per Second based on current setup.
- **Acceptance Criteria:**
  - Given I have equipped items and gems, when I view the Stats tab, then I see accurate, real-time calculated values for primary stats.
- **Technical Considerations:**
  - **Data Model:** Computed on the fly or cached in `characters.gearScore` and a new `character_stats` JSON column.
  - **API Routes:** `GET /api/characters/[id]/stats`.
  - **Components:** `StatsPanel` (Server/Client hybrid), `StatRow` (Client).
- **Tier Gating:** Free.
- **Dependencies:** F07, F09.
- **Test Requirements:** Extensive unit tests for stat calculation formulas (property-based testing recommended).

---

## Group C: Item Input

### F11: Manual Item Entry from Database

- **Description:** Form-based selection of items and gems from the internal database.
- **User Stories:**
  - As a free user, I want to manually select my current gems and their ranks to run an optimization.
- **Acceptance Criteria:**
  - Given I am on the optimizer page, when I open the gem selector, then I can search for a gem by name and select its current rank.
- **Technical Considerations:**
  - **Data Model:** Reads from existing `src/data/gems.json` and future `items` table.
  - **API Routes:** `GET /api/gems` (cached), `GET /api/items`.
  - **Components:** `DatabasePicker` (Client), `SearchInput` (Client).
- **Tier Gating:** Free.
- **Dependencies:** None (already partially exists in current codebase).
- **Test Requirements:** Component tests for search functionality, integration tests for API response caching.

### F12: Screenshot OCR for Equipment

- **Description:** Process screenshots of the equipment screen to auto-populate data.
- **User Stories:**
  - As a Tier 1 user, I want to upload a screenshot of my equipment so the app can automatically detect my items and gems.
- **Acceptance Criteria:**
  - Given I am on the Equipment tab, when I upload a valid screenshot, then the system processes it and presents a review UI with detected items for correction.
- **Technical Considerations:**
  - **Data Model:** New `ocr_jobs` table (`id`, `userId`, `status`, `imageUrl`, `resultJson`, `createdAt`).
  - **API Routes:** `POST /api/ocr/process`, `GET /api/ocr/jobs/[id]`.
  - **Components:** `ScreenshotUploader` (Client), `OcrReviewPanel` (Client).
  - **Tech:** Tesseract.js (client-side or server-side worker).
- **Tier Gating:** Tier 1.
- **Dependencies:** F01, F03, F07.
- **Test Requirements:** Integration tests for OCR pipeline, E2E tests for upload and review flow.

### F13: Screenshot OCR for Inventory

- **Description:** Process screenshots of the inventory screen.
- **User Stories:**
  - As a Tier 1 user, I want to upload an inventory screenshot to quickly add gems to my pool.
- **Acceptance Criteria:**
  - Given I upload an inventory screenshot, when the OCR completes, then I can review and add detected gems to my character's inventory.
- **Technical Considerations:**
  - **Data Model:** Reuses `ocr_jobs` table.
  - **API Routes:** Reuses `POST /api/ocr/process` with `type: 'inventory'`.
  - **Components:** Reuses `OcrReviewPanel` with inventory-specific layout.
- **Tier Gating:** Tier 1.
- **Dependencies:** F12, F08.
- **Test Requirements:** Integration tests for inventory-specific OCR parsing.

### F14: Item Database Browsing and Search

- **Description:** Allow users to browse all available items and gems in the game.
- **User Stories:**
  - As a user, I want to browse the gem database to learn about effects I haven't acquired yet.
- **Acceptance Criteria:**
  - Given I am on the database page, when I filter by "5-star" and "Offense", then I see only matching gems with their stats.
- **Technical Considerations:**
  - **Data Model:** Reads from `src/data/gems.json` and `docs/*.csv`.
  - **API Routes:** `GET /api/database/gems`, `GET /api/database/items`.
  - **Components:** `DatabaseBrowser` (Server), `FilterSidebar` (Client), `ItemDetailCard` (Client).
- **Tier Gating:** Free.
- **Dependencies:** F11.
- **Test Requirements:** Component tests for filter logic, integration tests for database API.

---

## Group D: Optimization Engine

### F15: Playstyle Presets Definition and Management

- **Description:** Allow users to select or define optimization goals.
- **User Stories:**
  - As a user, I want to select "Max DPS" or "Tank/Survival" to tailor the optimization recommendations.
- **Acceptance Criteria:**
  - Given I am on the optimize page, when I select "PvE: Speed Farming", then the optimizer weights movement speed and AoE damage higher.
- **Technical Considerations:**
  - **Data Model:** New `optimization_presets` table or hardcoded JSON config.
  - **API Routes:** `GET /api/presets`.
  - **Components:** `PresetSelector` (Client).
- **Tier Gating:** Free (basic presets), Tier 1 (custom presets).
- **Dependencies:** None (extends existing engine).
- **Test Requirements:** Unit tests for preset weight application.

### F16: Core Optimization Algorithm Extension

- **Description:** Enhance the current greedy algorithm with dynamic programming / branch-and-bound for better results.
- **User Stories:**
  - As a Tier 1 user, I want the most resource-efficient upgrade path, even if it requires multiple small upgrades.
- **Acceptance Criteria:**
  - Given I have limited resources, when I run advanced optimization, then the result maximizes total power gain within the exact resource budget.
- **Technical Considerations:**
  - **Data Model:** No schema changes.
  - **API Routes:** Extends `POST /api/optimize` with `algorithm: 'advanced'` flag.
  - **Components:** None (backend only).
- **Tier Gating:** Tier 1.
- **Dependencies:** F15.
- **Test Requirements:** Extensive property-based testing for algorithm correctness and budget constraints.

### F17: Before/After Comparison UI

- **Description:** Visually display the impact of recommended changes.
- **User Stories:**
  - As a user, I want to clearly see my stats before and after applying the recommended upgrades.
- **Acceptance Criteria:**
  - Given I have optimization results, when I view the recommendations, then I see a side-by-side comparison of total power and key stats.
- **Technical Considerations:**
  - **Components:** `ComparisonPanel` (Client), `StatDelta` (Client).
- **Tier Gating:** Free.
- **Dependencies:** F16.
- **Test Requirements:** Component tests for delta rendering (green/red indicators).

### F18: What-If Scenario Testing

- **Description:** Allow users to test changes without committing them to the saved build.
- **User Stories:**
  - As a user, I want to simulate upgrading a gem to rank 10 to see if it's worth the cost before I actually do it.
- **Acceptance Criteria:**
  - Given I am in what-if mode, when I adjust a gem rank, then the stats update instantly without altering my saved build.
- **Technical Considerations:**
  - **Data Model:** Temporary state in React (Client-side only).
  - **Components:** `WhatIfModal` (Client), `SandboxOptimizer` (Client).
- **Tier Gating:** Free.
- **Dependencies:** F16, F17.
- **Test Requirements:** Component tests for sandbox state isolation.

### F19: Build Saving and Versioning

- **Description:** Save multiple versions of a build for a character.
- **User Stories:**
  - As a user, I want to save my current setup as "Pre-Upgrade" and the optimized setup as "Post-Upgrade".
- **Acceptance Criteria:**
  - Given I have an optimized build, when I click "Save as New Version", then a new build is created linked to the same character.
- **Technical Considerations:**
  - **Data Model:** Add `parentId` to `builds` table for versioning.
  - **API Routes:** `POST /api/builds` (with `parentId`), `GET /api/builds/[id]/versions`.
  - **Components:** `SaveBuildModal` (Client), `VersionHistory` (Client).
- **Tier Gating:** Free (up to 5), Tier 1 (unlimited).
- **Dependencies:** F01, F06.
- **Test Requirements:** Integration tests for version tree creation and retrieval.

### F20: Build Sharing

- **Description:** Generate public links to share builds with others.
- **User Stories:**
  - As a user, I want to share my optimized build with my guild via a link.
- **Acceptance Criteria:**
  - Given I have a saved build, when I click "Share", then a public URL is generated that displays the build in read-only mode.
- **Technical Considerations:**
  - **Data Model:** Add `isPublic` boolean and `shareToken` to `builds` table.
  - **API Routes:** `POST /api/builds/[id]/share`, `GET /api/share/[token]`.
  - **Components:** `ShareDialog` (Client), `PublicBuildView` (Server).
- **Tier Gating:** Tier 1.
- **Dependencies:** F19.
- **Test Requirements:** Integration tests for token generation and public read access.

---

## Group E: AI Chat

### F21: AI Chat Interface

- **Description:** Provide a chat UI for natural language queries.
- **User Stories:**
  - As a Tier 2 user, I want to ask the AI questions about my build in plain English.
- **Acceptance Criteria:**
  - Given I am on the chat page, when I type a question, then I receive a relevant, formatted response within 5 seconds.
- **Technical Considerations:**
  - **Data Model:** New `chat_messages` table (`id`, `userId`, `role`, `content`, `createdAt`).
  - **API Routes:** `POST /api/chat` (streams response).
  - **Components:** `ChatWindow` (Client), `MessageBubble` (Client), `TypingIndicator` (Client).
- **Tier Gating:** Tier 2.
- **Dependencies:** F01, F03.
- **Test Requirements:** Component tests for chat UI, integration tests for streaming API.

### F22: Context Injection

- **Description:** Automatically include user's inventory, build, and character data in LLM prompts.
- **User Stories:**
  - As a user, I want the AI to know what gems I have without me having to list them.
- **Acceptance Criteria:**
  - Given I ask "What should I upgrade?", when the AI responds, then its advice is based on my actual current inventory and build.
- **Technical Considerations:**
  - **Data Model:** No new schema; reads from existing `characters`, `builds`, `inventory`.
  - **API Routes:** `POST /api/chat` gathers context before calling Kilo LLM Gateway.
  - **Components:** `ContextSidebar` (Client) showing what data is being sent.
- **Tier Gating:** Tier 2.
- **Dependencies:** F21, F08, F09.
- **Test Requirements:** Integration tests verifying context payload structure.

### F23: Chat History and Persistence

- **Description:** Save and retrieve past chat conversations.
- **User Stories:**
  - As a user, I want to pick up where I left off in a previous chat session.
- **Acceptance Criteria:**
  - Given I have chatted before, when I open the chat page, then my previous conversation is loaded.
- **Technical Considerations:**
  - **Data Model:** New `chat_sessions` table (`id`, `userId`, `title`, `createdAt`).
  - **API Routes:** `GET /api/chat/sessions`, `GET /api/chat/sessions/[id]/messages`.
  - **Components:** `SessionSidebar` (Client).
- **Tier Gating:** Tier 2.
- **Dependencies:** F21.
- **Test Requirements:** Integration tests for session retrieval.

### F24: Safety Guardrails and Response Validation

- **Description:** Ensure AI responses stay within game mechanics and cite sources.
- **User Stories:**
  - As a user, I want to trust that the AI isn't making up fake game mechanics.
- **Acceptance Criteria:**
  - Given I ask a question, when the AI responds, then all numerical claims are backed by data from `docs/*.csv` and hallucinations are rejected.
- **Technical Considerations:**
  - **Tech:** Kilo LLM Gateway with strict system prompts and RAG (Retrieval-Augmented Generation) from `docs/` folder.
  - **API Routes:** `POST /api/chat` includes validation layer.
- **Tier Gating:** Tier 2.
- **Dependencies:** F22.
- **Test Requirements:** Unit tests for prompt sanitization, E2E tests for known hallucination triggers.

---

## Group F: Public Site

### F25: Landing Page with Hero, Features, Pricing

- **Description:** The main marketing page for Glaucus.
- **User Stories:**
  - As a visitor, I want to understand what Glaucus does and how much it costs immediately.
- **Acceptance Criteria:**
  - Given I visit `/`, then I see a hero section, 3 feature highlights, and a 3-tier pricing table.
- **Technical Considerations:**
  - **Components:** `LandingPage` (Server), `HeroSection` (Client), `PricingTable` (Client).
- **Tier Gating:** N/A (Public).
- **Dependencies:** None.
- **Test Requirements:** E2E tests for page load and LCP metrics, component tests for responsive layout.

### F26: Demo/Preview Section

- **Description:** An interactive, no-login-required preview of the optimizer.
- **User Stories:**
  - As a visitor, I want to try the optimizer with dummy data before signing up.
- **Acceptance Criteria:**
  - Given I click "Try Demo", when I run an optimization, then I see realistic results without needing an account.
- **Technical Considerations:**
  - **Components:** `DemoOptimizer` (Client) with hardcoded mock data.
- **Tier Gating:** N/A (Public).
- **Dependencies:** F25, F16.
- **Test Requirements:** Component tests for demo state reset.

### F27: FAQ and Trivia Content

- **Description:** Educational content about Diablo Immortal mechanics.
- **User Stories:**
  - As a new player, I want to read guides on how resonance works.
- **Acceptance Criteria:**
  - Given I am on the FAQ section, when I click a question, then the answer expands smoothly.
- **Technical Considerations:**
  - **Data Model:** Static MDX files or `faq` table.
  - **Components:** `FaqAccordion` (Client), `TriviaCard` (Client).
- **Tier Gating:** N/A (Public).
- **Dependencies:** F25.
- **Test Requirements:** Component tests for accordion interaction.

### F28: Social Proof Section

- **Description:** Display community stats and testimonials.
- **User Stories:**
  - As a visitor, I want to see that other players trust and use this tool.
- **Acceptance Criteria:**
  - Given I scroll down the landing page, then I see a "Trusted by X players" badge and Discord link.
- **Technical Considerations:**
  - **Components:** `SocialProof` (Server) fetching aggregate stats from DB.
- **Tier Gating:** N/A (Public).
- **Dependencies:** F25.
- **Test Requirements:** Integration tests for stats aggregation.

---

## Database Migration Strategy Summary

1. **Milestone 1:** Create `users` and `subscriptions` tables. Migrate anonymous sessions to link to `userId`.
2. **Milestone 2:** Create `characters`, `builds`, `build_equipment`, `build_gems`, `build_resources` tables.
3. **Milestone 4:** Create `ocr_jobs` table.
4. **Milestone 6:** Create `chat_sessions` and `chat_messages` tables.

All migrations will be managed via `drizzle-kit` with backward-compatible schema changes.
