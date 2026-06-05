# DESIGN.md — Visual Design System & UI Implementation Guidelines

> **Project:** Glaucus — Diablo Immortal Gem Optimizer
> **Last updated:** 2026-06-05
> **Audience:** Any developer (AI or human) producing UI for this app

---

## Quick Start

1. Read this document before writing any UI code
2. Use the defined CSS variables — never write arbitrary hex values
3. Use existing UI primitives from `src/components/ui/` — never build from scratch
4. Follow the component patterns exactly as documented
5. If a pattern is not covered here, add it to this document

---

## 1. Design Principles

| Principle                      | What It Means                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| **Functional over decorative** | Every visual element serves a purpose. No decoration without function.                 |
| **Data-dense but readable**    | DI players need to see lots of numbers clearly. Prioritize legibility over whitespace. |
| **Mobile-first**               | Must work on phones during gameplay. Touch targets ≥ 44×44px.                          |
| **Dark theme primary**         | This is a gaming app. Dark background is the default and expected experience.          |
| **Consistent patterns**        | If a pattern exists, reuse it. Never invent ad-hoc solutions.                          |

---

## 2. Color System

### 2.1 Semantic CSS Variables (TweakCN Theme)

All colors are defined as CSS custom properties in `src/app/globals.css`. Use `var(--name)` in Tailwind via `bg-[var(--name)]` or `text-[var(--name)]`.

| Variable                   | Purpose                          | Dark Mode Value                |
| -------------------------- | -------------------------------- | ------------------------------ |
| `--background`             | Page background                  | `oklch(0 0 0)` (pure black)    |
| `--foreground`             | Primary text                     | `oklch(1 0 0)` (pure white)    |
| `--card`                   | Card/panel backgrounds           | `oklch(0.1400 0 0)`            |
| `--card-foreground`        | Card text                        | `oklch(1 0 0)`                 |
| `--popover`                | Dropdown/modal backgrounds       | `oklch(0.1800 0 0)`            |
| `--primary`                | Primary actions (buttons, links) | `oklch(1 0 0)`                 |
| `--primary-foreground`     | Text on primary                  | `oklch(0 0 0)`                 |
| `--secondary`              | Secondary surfaces               | `oklch(0.2500 0 0)`            |
| `--secondary-foreground`   | Text on secondary                | `oklch(1 0 0)`                 |
| `--muted`                  | Subtle backgrounds               | `oklch(0.2300 0 0)`            |
| `--muted-foreground`       | Secondary/dimmed text            | `oklch(0.7200 0 0)`            |
| `--accent`                 | Hover states, highlights         | `oklch(0.3200 0 0)`            |
| `--accent-foreground`      | Text on accent                   | `oklch(1 0 0)`                 |
| `--destructive`            | Errors, danger actions           | `oklch(0.6900 0.2000 23.9100)` |
| `--destructive-foreground` | Text on destructive              | `oklch(0 0 0)`                 |
| `--border`                 | Borders, dividers                | `oklch(0.2600 0 0)`            |
| `--input`                  | Form input backgrounds           | `oklch(0.3200 0 0)`            |
| `--ring`                   | Focus rings                      | `oklch(0.7200 0 0)`            |

### 2.2 Status & Feedback Colors

| Variable                             | Use Case                          |
| ------------------------------------ | --------------------------------- |
| `--warning` / `--warning-foreground` | Warnings, cautions                |
| `--info` / `--info-foreground`       | Informational messages            |
| `--success` / `--success-foreground` | Success confirmations             |
| `--color-error`                      | Error states                      |
| `--color-hover-overlay`              | Hover overlay (`rgba(0,0,0,0.1)`) |
| `--color-focus-ring`                 | Focus ring                        |
| `--color-disabled-opacity`           | Disabled state (`0.5`)            |

### 2.3 Game Context Color Mapping

| Game Concept       | CSS Variable                                     | Visual Reference      |
| ------------------ | ------------------------------------------------ | --------------------- |
| Legendary (5-star) | `--color-gem-5star` / `--color-gem-5star-border` | `#fbbf24` / `#f59e0b` |
| 2-Star gems        | `--color-gem-2star`                              | `#60a5fa` (blue)      |
| 1-Star gems        | `--color-gem-1star`                              | `#9ca3af` (gray)      |
| Tier S             | `--color-tier-s`                                 | Warm gold             |
| Tier A             | `--color-tier-a`                                 | Cool blue             |
| Tier B             | `--color-tier-b`                                 | Orange                |
| Tier C/D           | `--color-tier-c` / `--color-tier-d`              | Muted blue            |
| Offense gems       | `--effect-offense` / `--effect-offense-fg`       | Red                   |
| Defense gems       | `--effect-defense` / `--effect-defense-fg`       | Blue                  |
| Utility gems       | `--effect-utility` / `--effect-utility-fg`       | Yellow                |
| CC gems            | `--effect-cc` / `--effect-cc-fg`                 | Pink                  |
| All-round gems     | `--effect-all` / `--effect-all-fg`               | Purple                |

### 2.4 Forbidden Color Practices

- NO arbitrary hex values: `bg-[#123456]`
- NO inline style colors: `style={{ color: '#abc' }}`
- NO gradient backgrounds without documented purpose
- NO hardcoded opacity values — use the CSS variables

---

## 3. Typography

### 3.1 Font Families

| Variable       | Font Stack                                      | Use Case                 |
| -------------- | ----------------------------------------------- | ------------------------ |
| `--font-sans`  | `"Geist", ui-sans-serif, sans-serif, system-ui` | All body text, UI labels |
| `--font-mono`  | `"Geist Mono", ui-monospace, monospace`         | Code, formatted numbers  |
| `--font-serif` | `Georgia, serif`                                | Not used in product UI   |

### 3.2 Type Scale

| Tailwind Class | Size     | Use Case                             |
| -------------- | -------- | ------------------------------------ |
| `text-xs`      | 0.75rem  | Labels, badges, helper text          |
| `text-sm`      | 0.875rem | Body text, form inputs, descriptions |
| `text-base`    | 1rem     | Default paragraph text               |
| `text-lg`      | 1.125rem | Section subheadings                  |
| `text-xl`      | 1.25rem  | Section headings                     |
| `text-2xl`     | 1.5rem   | Page titles, card titles             |

**Maximum text size in product UI:** `text-2xl`. Nothing larger.

### 3.3 Font Weight Conventions

| Weight   | Tailwind        | Use Case                                |
| -------- | --------------- | --------------------------------------- |
| Normal   | `font-normal`   | Body text (rarely needed — default)     |
| Medium   | `font-medium`   | Labels, navigation items, metadata      |
| Semibold | `font-semibold` | Headings, card titles, important labels |
| Bold     | `font-bold`     | Emphasis only — use sparingly           |

### 3.4 Number Formatting

**ALL game statistics, prices, damage values, and numeric data MUST use `tabular-nums`:**

```tsx
<span className="tabular-nums">12,345</span>
```

### 3.5 Forbidden Typography

- NO decorative fonts
- NO mixed font families within a component
- NO text larger than `text-2xl` in product UI
- NO `font-thin` or `font-extralight` (hurts readability on dark backgrounds)
- NO text with low contrast against background

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

Use Tailwind default spacing scale only. These are the values you may use:

| Scale | Pixel Value | Use Case                         |
| ----- | ----------- | -------------------------------- |
| `1`   | 0.25rem     | Tight inline gaps                |
| `2`   | 0.5rem      | Small gaps between related items |
| `3`   | 0.75rem     | Label-to-input gaps              |
| `4`   | 1rem        | Standard component padding       |
| `6`   | 1.5rem      | Section gaps                     |
| `8`   | 2rem        | Content area padding             |
| `12`  | 3rem        | Page section spacing             |
| `16`  | 4rem        | Major section breaks             |
| `20`  | 5rem        | Layout container margins         |
| `24`  | 6rem        | Page-level spacing               |

### 4.2 Page Layout Pattern

```tsx
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Page content */}
</main>
```

### 4.3 Card-Based Layout

Every section of content is a card:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Section Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
  <CardFooter>{/* Actions */}</CardFooter>
</Card>
```

### 4.4 Grid Patterns

```tsx
// Responsive card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

// Compact list grid (gem inventory)
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
  {/* Items */}
</div>
```

---

## 5. Component Patterns

### 5.1 Button Variants

| Variant                  | When to Use                               | Tailwind Pattern                                                 |
| ------------------------ | ----------------------------------------- | ---------------------------------------------------------------- |
| `default` / `primary`    | Primary CTAs, form submission, "Optimize" | `bg-[var(--primary)] text-[var(--primary-foreground)]`           |
| `secondary`              | Secondary actions, "Save", "Cancel"       | `bg-[var(--secondary)] text-[var(--secondary-foreground)]`       |
| `outline`                | Tertiary actions, "View Details"          | `border border-[var(--border)] bg-transparent`                   |
| `ghost`                  | Inline actions, icon buttons, nav items   | `hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]` |
| `destructive` / `danger` | Delete, remove, destructive actions       | `bg-[var(--destructive)] text-[var(--destructive-foreground)]`   |
| `link`                   | Inline navigation                         | `text-[var(--primary)] underline`                                |

```tsx
// Primary action
<Button variant="default">Optimize</Button>

// Secondary action
<Button variant="secondary">Save Build</Button>

// Icon button
<Button variant="ghost" size="icon" aria-label="Close">
  <X className="h-4 w-4" />
</Button>

// Loading state
<Button loading>Loading...</Button>
```

### 5.2 Form Inputs

Consistent pattern: label above, error below, helper text optional.

```tsx
<Input
  label="Build Name"
  placeholder="Enter build name"
  value={name}
  onChange={(val) => setName(val)}
  error={errors.name}
  helperText="Max 100 characters"
  fullWidth
/>
```

### 5.3 Tables

Data tables for stats, inventory, gem lists:

```tsx
<div className="overflow-x-auto">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-[var(--border)]">
        <th className="text-left py-2 px-3 font-medium text-[var(--muted-foreground)]">
          Gem
        </th>
        <th className="text-right py-2 px-3 font-medium text-[var(--muted-foreground)]">
          Damage
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-[var(--border)]">
        <td className="py-2 px-3">Blessed Life</td>
        <td className="py-2 px-3 text-right tabular-nums">+1,234</td>
      </tr>
    </tbody>
  </table>
</div>
```

### 5.4 Badges

```tsx
// Rarity badge
<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)]">
  Rank 5
</span>
```

### 5.5 Loading States

```tsx
// Single skeleton
<Skeleton className="h-4 w-32" />

// Skeleton text block
<SkeletonText lines={3} />

// Skeleton gem card
<SkeletonGemCard />

// Skeleton grid
<SkeletonGrid count={6} variant="gem" />
```

### 5.6 Empty States

```tsx
<Card>
  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-[var(--muted-foreground)] mb-2">
      No builds saved yet
    </div>
    <p className="text-sm text-[var(--muted-foreground)] mb-4">
      Run an optimization and save the results to see them here.
    </p>
    <Button variant="default">Run Optimization</Button>
  </CardContent>
</Card>
```

### 5.7 Toast Notifications

```tsx
const { success, error, warning, info } = useToastActions();

// When to use each:
success("Build saved", "Your build has been saved successfully.");
error("Optimization failed", "Could not calculate optimal gems.");
warning("Budget exceeded", "Recommended gems exceed your available resources.");
info("Session restored", "Your previous session has been loaded.");
```

---

## 6. Game-Specific UI Patterns

### 6.1 Gem Display Cards

```tsx
// Gem card in inventory/catalog
<Card className="cursor-pointer transition-colors hover:bg-[var(--accent)]">
  <CardContent className="p-3">
    <div className="flex items-start gap-2">
      {/* Gem icon placeholder */}
      <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
        {/* Icon */}
      </div>
      <div className="min-w-0">
        <div className="font-medium text-sm truncate">Blessed Life</div>
        <div className="text-xs text-[var(--muted-foreground)]">Rank 5</div>
      </div>
    </div>
  </CardContent>
</Card>
```

### 6.2 Stat Blocks

```tsx
// Comparison stat block (before/after)
<div className="flex items-center gap-2 text-sm">
  <span className="text-[var(--muted-foreground)] w-32">Damage:</span>
  <span className="tabular-nums text-[var(--destructive)] line-through">
    12,345
  </span>
  <span>→</span>
  <span className="tabular-nums text-[var(--success)] font-semibold">
    15,678
  </span>
  <span className="text-xs text-[var(--success)]">(+3,333)</span>
</div>
```

### 6.3 Resource Display

```tsx
// Resource bar (platinum, powder, pearls)
<div className="flex items-center gap-2">
  {/* Icon */}
  <div className="w-5 h-5 rounded bg-[var(--muted)]" />
  <span className="text-sm tabular-nums">12,345</span>
  <span className="text-xs text-[var(--muted-foreground)]">Platinum</span>
</div>
```

### 6.4 Star Rating Display

Use the defined CSS variables for star colors:

```tsx
<div className="flex gap-0.5">
  {[1, 2, 3, 4, 5].map((star) => (
    <Star
      key={star}
      className={`w-4 h-4 ${star <= rating ? "fill-[var(--color-gem-5star)] text-[var(--color-gem-5star)]" : "text-[var(--muted)]"}`}
    />
  ))}
</div>
```

### 6.5 Tier Badge

```tsx
<span
  className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
  style={{
    backgroundColor: `var(--color-tier-${tier.toLowerCase()})`,
    color: "var(--background)",
  }}
>
  {tier}
</span>
```

---

## 7. Responsive Behavior

### 7.1 Breakpoints

| Breakpoint | Width  | Use Case                         |
| ---------- | ------ | -------------------------------- |
| `sm`       | 640px  | Phone landscape                  |
| `md`       | 768px  | Tablet portrait                  |
| `lg`       | 1024px | Tablet landscape / small desktop |
| `xl`       | 1280px | Desktop                          |

### 7.2 Touch Targets

All interactive elements MUST have minimum 44×44px touch targets:

```tsx
// Button is already h-10 (40px) + padding — meets minimum
// For smaller elements, add padding:
<button className="p-2 min-h-[44px] min-w-[44px]">
  <Icon className="w-5 h-5" />
</button>
```

### 7.3 Responsive Tables

Tables that don't fit on mobile convert to card layout:

```tsx
{
  /* Desktop: table */
}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full">...</table>
</div>;

{
  /* Mobile: cards */
}
<div className="md:hidden space-y-3">
  {items.map((item) => (
    <Card key={item.id}>
      <CardContent className="p-3">...</CardContent>
    </Card>
  ))}
</div>;
```

### 7.4 Responsive Grids

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
```

---

## 8. Animation & Transitions

### 8.1 Duration Tokens

| Duration | Use Case                                |
| -------- | --------------------------------------- |
| `150ms`  | Hover state changes, micro-interactions |
| `200ms`  | Focus states, button press              |
| `300ms`  | Modal open/close, slide-in toasts       |

### 8.2 When to Animate

- Hover states on cards and buttons (`transition-colors`)
- Modal/dialog open and close
- Loading state transitions
- Toast slide-in (built into Toast component)

### 8.3 When NOT to Animate

- Data value changes (stat updates, number changes)
- List reordering (too much motion is distracting)
- Page transitions (keep it instant)

### 8.4 Animation Style

Subtle and purposeful only:

```tsx
// Correct: subtle color transition
<div className="transition-colors duration-150 hover:bg-[var(--accent)]" />

// Correct: modal fade
<div className="animate-in fade-in duration-300" />
```

**Forbidden:**

- No bounce animations
- No spin animations (except loading spinners)
- No decorative motion

---

## 9. Accessibility

### 9.1 Contrast

All text MUST meet WCAG AA contrast ratios:

- Normal text (under 18pt): 4.5:1 minimum
- Large text (18pt+ or 14pt+ bold): 3:1 minimum

**Rule of thumb:** If it looks hard to read, it probably fails. Use `--foreground` for body text, `--muted-foreground` for secondary text. Never use `--muted-foreground` on `--muted` background.

### 9.2 Focus States

All interactive elements MUST have visible focus rings:

```tsx
// Already built into Button, Input, Select components:
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]";
```

### 9.3 Screen Reader

- All icon buttons MUST have `aria-label`
- All form inputs MUST have associated labels
- Use `role="alert"` for error messages
- Status updates use `<ScreenReaderAnnouncer>` component

```tsx
<Button variant="ghost" size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

### 9.4 Keyboard Navigation

- All interactive elements reachable via Tab
- Modals trap focus and close on Escape
- Dropdowns navigable via arrow keys

---

## 10. Anti-Patterns (Explicitly Forbidden)

| Anti-Pattern                           | Why                                        | Example to Avoid                                        |
| -------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Arbitrary Tailwind values              | Breaks consistency, hard to maintain       | `w-[347px]`, `bg-[#123456]`                             |
| Inline styles for colors/spacing       | Cannot be themed, breaks dark mode         | `style={{ color: '#abc', padding: '12px' }}`            |
| Gradients without documented purpose   | Decorative, not functional                 | `bg-gradient-to-r from-blue-500 to-purple-500`          |
| Decorative icons without meaning       | Noise, not signal                          | Random sparkles, stars as decoration                    |
| Ultra-thin fonts                       | Hurts readability on dark backgrounds      | `font-thin`, `font-extralight`                          |
| Low-contrast text                      | Fails WCAG, hard to read                   | `text-[var(--muted-foreground)]` on `bg-[var(--muted)]` |
| Emoji in production UI                 | Not professional, inconsistent rendering   | `✅`, `❌`, `⚠️` — use lucide-react icons instead       |
| Shadows larger than `shadow-lg`        | Too heavy, breaks dark theme aesthetic     | `shadow-xl`, `shadow-2xl`                               |
| Border-radius larger than `rounded-xl` | Inconsistent with component library        | `rounded-2xl`, `rounded-full` (except avatars)          |
| Custom fonts beyond defined typeface   | Breaks performance, inconsistent rendering | `font-['CustomFont']`, Google Fonts imports             |

---

## 11. Z-Index Hierarchy

| Element             | CSS Variable         | Value |
| ------------------- | -------------------- | ----- |
| Modal backdrop      | `--z-modal-backdrop` | 40    |
| Modal/dialog        | `--z-modal`          | 50    |
| Toast notifications | `--z-toast`          | 60    |

Use these variables for any custom z-index needs. Never hardcode z-index values.

---

## 12. Shadow Tokens

| Token         | Use Case                            |
| ------------- | ----------------------------------- |
| `--shadow-sm` | Cards, inputs (default)             |
| `--shadow`    | General elevation                   |
| `--shadow-md` | Dropdowns, popovers                 |
| `--shadow-lg` | Modals, toasts                      |
| `--shadow-xl` | Rarely — only for critical overlays |

**Never use `--shadow-2xl`** — it is too heavy for this design system.

---

## 13. File Locations

| Resource              | Path                                      |
| --------------------- | ----------------------------------------- |
| CSS variables / theme | `src/app/globals.css`                     |
| UI components         | `src/components/ui/`                      |
| Target UI primitives  | `shared/ui/` (per TARGET-ARCHITECTURE.md) |
| Utility functions     | `src/lib/utils/`                          |
| Game data             | `src/data/`                               |
