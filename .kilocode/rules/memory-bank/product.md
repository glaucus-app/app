# Product Context: Glaucus App (Diablo Immortal Legendary Gems Optimizer)

## Why This Product Exists

Diablo Immortal players face complex decisions when upgrading legendary gems. Resources are scarce (platinum, Telluric Pearls), and making suboptimal choices can set players back significantly. Unlike World of Warcraft, which has tools like Raidbots and Ask Mr. Robot for optimization, Diablo Immortal lacks a dedicated gem optimization tool.

## Problems It Solves

1. **Decision Paralysis**: Players don't know which gems to upgrade first
2. **Resource Waste**: Suboptimal upgrades waste limited resources
3. **Build Complexity**: Understanding gem synergies and breakpoints is difficult
4. **No Unified Tool**: Information is scattered across wikis, forums, and spreadsheets
5. **Character Verification**: No easy way to verify Battle.net character ownership

## How It Should Work (User Flow)

### Primary Flow (Manual Entry)

1. User visits Glaucus App
2. User selects legendary gems from a categorized list
3. User specifies quality (1-5★) and rank (1-10) for each gem
4. User enters available resources (platinum, pearls, etc.)
5. User clicks "Optimize"
6. System returns prioritized upgrade recommendations with expected power gains
7. User follows recommendations in-game

### Secondary Flow (Screenshot Upload - Paid Tier)

1. User uploads inventory screenshot
2. OCR detects gems, qualities, and ranks automatically
3. User confirms detected data
4. Proceed with optimization

### Authentication Flow

1. User clicks "Sign in with Battle.net"
2. User authorizes via Battle.net OAuth
3. User enters character ID
4. System verifies via diabloimmortalredeem.com API mock code
5. Character linked to account

## Key User Experience Goals

- **Fast Results**: Optimization in under 5 seconds
- **Clear Recommendations**: Understandable output for casual players
- **Accurate Data**: Up-to-date gem data from diablo.tv
- **Trust**: Transparent methodology and calculations
- **Value**: Free tier useful enough to hook users, paid tier compelling enough to convert

## User Personas

### Free Player (Casual)

- Plays 1-2 hours daily
- Limited resources
- Wants basic optimization
- May not have Battle.net linked

### Dolphin (Paid Tier 1)

- Plays 2-4 hours daily
- Some paid purchases
- Wants advanced features
- Uses screenshot upload
- Saves and shares builds

### Whale (Paid Tier 2)

- Heavy spender
- Multiple characters
- Wants full API access
- Historical tracking
- Build analytics

## What This Product Provides

1. **Gem Database**: Complete legendary gem information with stats at each rank
2. **Optimization Engine**: Algorithm that factors in resources, current build, and goals
3. **DI Days Integration**: Current events and bonuses from diablo.tv
4. **Character Sync**: Battle.net OAuth with character verification
5. **Build Management**: Save, share, and compare builds
6. **Mobile-Friendly**: Works on mobile browsers for in-game use

## Integration Points

- **Battle.net OAuth**: Primary authentication
- **diablo.tv API**: DI days and event data
- **diabloimmortalredeem.com API**: Character verification via mock redemption
- **Database**: Drizzle + SQLite for data persistence
- **Payment**: TBD (Stripe, PayPal, etc.)

## Competitive Advantages

| Feature          | Glaucus App    | Competitors     |
| ---------------- | -------------- | --------------- |
| Gem Optimization | ✅ Specialized | ❌ General only |
| DI Integration   | ✅ Native      | ⚠️ Manual data  |
| Battle.net Sync  | ✅ Verified    | ❌ None         |
| Screenshot OCR   | ✅ Planned     | ❌ None         |
| Free Tier        | ✅ Useful      | ⚠️ Limited      |

## Monetization Strategy

### Free Tier

- Basic optimization (greedy algorithm)
- Manual gem entry (up to 6 gems)
- No build saving
- Ads supported

### Paid Tier 1 ($5/month)

- Advanced optimization (dynamic programming)
- Screenshot OCR
- Build saving/sharing
- Ad-free experience
- Priority support

### Paid Tier 2 ($15/month)

- Everything in Tier 1
- Battle.net character sync
- Historical tracking
- API access
- Multiple character slots
- Analytics dashboard
