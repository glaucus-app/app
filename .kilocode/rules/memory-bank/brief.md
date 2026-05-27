# Project Brief: Glaucus App (Diablo Immortal Legendary Gems Optimizer)

## Purpose

A web application for optimizing legendary gems in Diablo Immortal, similar to World of Warcraft tools like Raidbots (https://www.raidbots.com/simbot) and Ask Mr. Robot (https://www.askmrrobot.com/).

## Target Users

- Diablo Immortal players seeking to optimize their legendary gem builds
- Players with limited resources wanting to maximize gem upgrade efficiency
- Data collectors interested in character data and Battle.net account linking

## Core Use Case

1. **Gem Inventory**: User uploads screenshots or selects legendary gems from a list, specifying quality and rank
2. **Resource Input**: User sets available resources (platinum, Telluric Pearls, etc.)
3. **Optimization**: User clicks "optimize" and receives recommendations
4. **Action**: User follows the optimization result recommendations

## Key Requirements

### Must Have

- **Gem Selection/Upload**: Screenshot upload AND manual selection from gem list
  - Gem type selection
  - Quality specification
  - Rank tracking
- **Resource Management**: Input fields for:
  - Platinum amount
  - Telluric Pearls amount
  - Other relevant resources
- **Optimization Engine**: Algorithm to recommend best gem upgrades given resources
- **DI Data Integration**: Use DI days from https://diablo.tv/

### Nice to Have

- Screenshot OCR for automatic gem detection
- Export/import build configurations
- History of optimization results

## Monetization

### Free Tier

- Basic optimization
- Limited gem selections
- Manual data entry only

### Paid Tier 1

- Advanced optimization algorithms
- Screenshot upload with OCR
- Build saving/sharing
- Priority support

### Paid Tier 2

- All Tier 1 features
- Battle.net character sync
- Historical tracking
- API access

## Authentication

### Battle.net OAuth

- Primary authentication method
- Character ID verification via in-game confirmation
- API validation through https://diabloimmortalredeem.com/ API
  - Mock redemption code for verification (returns informative error codes)

## Secondary Goals

### Data Collection

- User character data aggregation
- Battle.net account to character ID linkage
- Build analytics and trends

## Success Metrics

- Users successfully optimizing their builds
- Conversion rate to paid tiers
- Character verification success rate
- Data collection accuracy

## Constraints

- Must comply with Battle.net API terms of service
- Must not violate Diablo Immortal terms of service
- Framework: Next.js 16 + React 19 + Tailwind CSS 4
- Package manager: Bun
- Database: Drizzle + SQLite (via recipe)

## External Integrations

| Integration              | Purpose                    | Status  |
| ------------------------ | -------------------------- | ------- |
| Battle.net OAuth         | Authentication             | Planned |
| diablo.tv                | DI days data               | Planned |
| diabloimmortalredeem.com | Character verification API | Planned |

## References

- Similar tools: Raidbots, Ask Mr. Robot
- Data source: diablo.tv
- Verification: diabloimmortalredeem.com API
