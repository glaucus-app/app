# Data Audit Report — June 5, 2026

## Summary

Full audit of all game data files against current Diablo Immortal state as of June 5, 2026. Sources consulted:

- **Primary**: Diablo Wiki (diablo.fandom.com) — game updates, legendary gems lists
- **Secondary**: Blizzard News (news.blizzard.com) — official patch notes and roadmap
- **Tertiary**: MisterMenPlays.com — gem lists and tier lists
- **Reference**: diablo.tv — community builds/tools (JS-rendered, limited scrapable content)

Last data refresh in this repo: **February 18, 2026**

---

## 1. Legendary Gems Audit (src/data/gems.json)

### Current State

- **1-star gems**: 28 gems present
- **2-star gems**: 28 gems present
- **5-star gems**: 27 gems present
- Total: **83 legendary gems**

### Missing Gems (added since Feb 18, 2026)

| Gem Name           | Stars | Source                 | Added               | Status     |
| ------------------ | ----- | ---------------------- | ------------------- | ---------- |
| **Taxman's Pity**  | 1     | Standard pool          | March 19, 2026      | NEEDS DATA |
| **Tundra Blight**  | 2     | Standard pool          | March 19, 2026      | NEEDS DATA |
| **Leviathan Tomb** | 5     | Standard pool          | March 19, 2026      | NEEDS DATA |
| **The Crucible**   | 2     | Special (event)        | ~April 2026         | NEEDS DATA |
| **Baneboil**       | ?     | Standard pool          | May 13, 2026        | NEEDS DATA |
| **Blood Floe**     | 5     | Standard pool          | Unknown             | NEEDS DATA |
| **Wulfheort**      | 5     | Standard pool          | Unknown             | NEEDS DATA |
| **War Herald**     | 2     | Special (Empowered BP) | From next BP season | NEEDS DATA |

### Naming Discrepancies

- **Wolfheart** (in our data) vs **Wulfheort** (in wiki): The wiki now lists this gem as "Wulfheort" in the standard 5-star pool. This may be a rename or a separate gem. **NEEDS VERIFICATION** from diablo.tv or in-game.

### No Deprecated Gems Found

All existing gems in gems.json remain in current drop pools. No gems have been removed from the game.

### Tier List Status

Our tier lists in docs/legendary-gems.csv and docs/legendary-gems/tier-lists.md should be re-evaluated after new gem effects are documented. New gems may shift the meta significantly.

---

## 2. CSV Files Audit

### 2.1 character-attributes.csv

**Classes**: The file references "9 current DI classes (10th TBD)". This is now confirmed:

- **10th class = Warlock**, releasing June 2026 (confirmed Feb 11, 2026 Diablo 30th Anniversary Spotlight)
- Warlock wields a demon skull (main hand) and sacrificial blade (off hand)
- Uses Vizjerei magic, can summon/command demons via portals
- Signature tool: Soulgorger (demonic beast)

**System Changes Affecting This File**:

- **Beneficial Effect Duration cap**: Increased from 80% to **104%** (March 19, 2026)
- **Resonance cap**: Increased to **13,024** with new wing tier at 13,000
- **Awakening requirement**: Lowered from gem rank 4 to **gem rank 3**
- **Wing Awakening slot requirements**: Lowered by 1 gem rank each
- **Progressive upgrade**: Enabled for 1- and 2-star Legendary Gems from rank 4

**CR Table**: No changes to base CR/Resonance values confirmed, but new gems add new CR totals.

### 2.2 character-equipment.csv

**Confirmed Changes**:

- Set Items now always drop with **fixed number of sockets** (March 19, 2026)
- Left and right rings given **distinct icons** (Jan 21, 2026)
- Inferno XI legendary items available
- New Inferno XII difficulty confirmed (data TBD)

**No structural changes** to equipment slots or item types confirmed.

### 2.3 currencies-and-materials.csv

**Confirmed Changes**:

- **Normal Gems stack size** increased to **9999** (Jan 21, 2026)
- Market listing requirement for Normal Gems increased to **Inferno VIII** (Jan 21, 2026)
- **War Herald** (new item type) from empowered Battle Pass
- New currencies/materials may exist for Warlock class and Lut Gholein content

**Needs verification**: Exact prices and drop rates for new materials.

### 2.4 damage-calculation.csv

**Confirmed Changes**:

- Vithu's Urges balance changes (March 19, 2026) — specific formula changes need verification
- Beneficial Effect Duration cap change (80% → 104%) affects buff uptime calculations
- No changes to core damage formulas confirmed

### 2.5 game-mechanics.csv

**Confirmed Changes**:

- Warlock class needs full skills/essences/stances data
- New Harmful Effects or mechanics from Warlock abilities TBD
- No changes to existing CC/Debuff/DoT categorizations confirmed

### 2.6 legendary-gems.csv

**Needs Updates**:

- Add new gems (Taxman's Pity, Tundra Blight, Leviathan Tomb, The Crucible, Baneboil, Blood Floe, Wulfheort/Wolfheart rename, War Herald)
- Update tier lists with new gems
- Resonance gems table needs updating for new gem combinations
- Awakening requirements changed (rank 3 → previously rank 4)
- Progressive upgrade for 1/2-star gems from rank 4

### 2.7 normal-gems.csv

**Confirmed Changes**:

- Stack size: 9999 (was likely lower)
- All other data (upgrade costs, stat values, refinement) appears unchanged
- No new normal gem types added

### 2.8 activities.csv

Not reviewed in detail. Likely needs updates for:

- New Helliquary bosses
- New zone events
- Warlock class content
- Lut Gholein subzones
- New endgame PVE challenges

### 2.9 basics.csv

Not reviewed in detail.

---

## 3. Legendary Gems Directory (docs/legendary-gems/)

All existing files present and accounted for:

- overview.md ✓
- 1-star-gems.md ✓
- 2-star-gems.md ✓
- 5-star-gems.md ✓
- gem-effects-1-star.md ✓
- gem-effects-2-star.md ✓
- gem-effects-5-star.md ✓
- resonance-gems.md ✓
- auxiliary-gems.md ✓
- upgrading.md ✓
- tier-lists.md ✓
- gem-setups.md ✓

**Needs**: New gem detail files for all 8 missing gems listed above.

---

## 4. Known Gaps

### 4.1 New Gem Effects (Critical)

The following gems have been confirmed to exist but their exact effects, stats per rank, and resonance gem combinations are **not yet documented** in our files:

- Taxman's Pity (1-star)
- Tundra Blight (2-star)
- Leviathan Tomb (5-star)
- The Crucible (2-star, event)
- Baneboil (star rating unknown)
- Blood Floe (5-star)
- Wulfheort (5-star, may be renamed Wolfheart)
- War Herald (2-star, BP)

These need to be scraped from diablo.tv or verified in-game before adding to gems.json.

### 4.2 Warlock Class Data

Warlock releasing June 2026. No skills, essences, stances, or class-affix data available yet. Full class data file needs to be created.

### 4.3 Inferno XI-XII Data

Equipment stats and CR tables for Inferno XI and XII are placeholders (empty rows) in current CSVs.

### 4.4 Balance Changes

Multiple balance patches since Feb 2026 need review for exact number changes:

- January 21, 2026
- February 4, 2026
- March 19, 2026
- April 1, 2026
- April 15, 2026
- April 29, 2026
- May 13, 2026
- May 27, 2026

### 4.5 New Helliquary Bosses

New bosses from Thorncrown, Crooked Bough, Abysslurker, and Warlock-era bosses need Helliquary Affixes data.

---

## 5. Discrepancies Resolved

| Issue                          | Resolution                                     |
| ------------------------------ | ---------------------------------------------- |
| 10th class status              | Confirmed: Warlock, June 2026                  |
| Beneficial Effect Duration cap | Updated: 80% → 104%                            |
| Awakening requirement          | Updated: Rank 4 → Rank 3                       |
| Resonance cap                  | Updated: new tier at 13,000, max 13,024        |
| Progressive upgrades           | 1/2-star gems upgradable from rank 4           |
| Set item sockets               | Now fixed on drop                              |
| Normal gem stack size          | 9999                                           |
| Wolfheart/Wulfheort naming     | Flagged for verification — wiki says Wulfheort |

---

## 6. Recommendations for Keeping Data Fresh

### 6.1 Automated Sync (Recommended)

- **Scrape diablo.tv** weekly using a headless browser (Puppeteer/Playwright) since the site is JS-rendered
- **Parse Blizzard patch notes** from news.blizzard.com/en-us/diablo-immortal/ — structured RSS or scheduled fetch
- **Monitor Diablo Wiki** edit history (diablo.fandom.com) for game update pages
- Create a `scripts/sync-game-data.ts` script that:
  1. Fetches patch notes
  2. Extracts new gems, balance changes, new content
  3. Flags items that need manual verification
  4. Generates a diff report

### 6.2 Manual Review Cadence

- **Every 2 weeks**: Check for new game updates and balance patches
- **Monthly**: Full audit of gems.json and tier lists
- **Per major patch**: Update all affected CSVs and gem detail files
- **Pre-Warlock launch**: Complete Warlock class data before June 2026

### 6.3 Data Validation

- Add a `validate-game-data.ts` script that checks:
  - All gems referenced in CSVs exist in gems.json
  - No duplicate gem IDs
  - Star ratings are valid (1, 2, or 5)
  - Tier values are valid (S, A, B, C, D)
  - Resonance/CR tables have consistent progression

### 6.4 Version Control

- Tag data files with a `dataVersion` field (currently "1.0.0" in gems.json)
- Maintain a CHANGELOG.md in docs/ for data changes
- Include `lastVerified` date on each gem to track when data was last checked

---

## 7. Sources Used

| Source         | URL                                                         | Content Type                            |
| -------------- | ----------------------------------------------------------- | --------------------------------------- |
| Diablo Wiki    | diablo.fandom.com/wiki/List_of_Diablo_Immortal_game_updates | Complete patch history                  |
| Diablo Wiki    | diablo.fandom.com/wiki/Legendary_Gems                       | Current gem list with pools             |
| Blizzard News  | news.blizzard.com/en-us/article/24247154                    | Warlock reveal, 2026 roadmap            |
| MisterMenPlays | mistermenplays.com/diabloimmortal/legendarygems             | Gem list, tier lists                    |
| diablo.tv      | diablo.tv                                                   | Build tools, leaderboards (JS-rendered) |
| Icy Veins      | icy-veins.com                                               | News and analysis                       |

---

_Audit completed: June 5, 2026_
_Auditor: Birch-polecat_
