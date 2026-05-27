# Technical Context: Glaucus App (Diablo Immortal Legendary Gems Optimizer)

## Technology Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 16.x    | React framework with App Router |
| React        | 19.x    | UI library                      |
| TypeScript   | 5.9.x   | Type-safe JavaScript            |
| Tailwind CSS | 4.x     | Utility-first CSS               |
| Bun          | Latest  | Package manager & runtime       |
| Drizzle ORM  | Latest  | Database ORM                    |
| SQLite       | N/A     | Database (via better-sqlite3)   |
| NextAuth     | 5.x     | Authentication                  |
| Zod          | 4.x     | Schema validation               |

## Development Environment

### Prerequisites

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- Node.js 20+ (for compatibility)

### Commands

```bash
bun install        # Install dependencies
bun dev            # Start dev server (http://localhost:3000)
bun build          # Production build
bun start          # Start production server
bun lint           # Run ESLint
bun typecheck      # Run TypeScript type checking
```

## Project Configuration

### Next.js Config (`next.config.ts`)

- App Router enabled
- Default settings for flexibility

### TypeScript Config (`tsconfig.json`)

- Strict mode enabled
- Path alias: `@/*` → `src/*`
- Target: ESNext

### Tailwind CSS 4 (`postcss.config.mjs`)

- Uses `@tailwindcss/postcss` plugin
- CSS-first configuration (v4 style)

### ESLint (`eslint.config.mjs`)

- Uses `eslint-config-next`
- Flat config format

## Key Dependencies

### Production Dependencies

```json
{
  "next": "^16.1.3",
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "next-auth": "^5.0.0-beta.30",
  "@auth/drizzle-adapter": "^1.11.1",
  "drizzle-orm": "^0.45.1",
  "better-sqlite3": "^12.6.2",
  "lucide-react": "^0.564.0",
  "zod": "^4.3.6"
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.9.3",
  "@types/node": "^24.10.2",
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.2.3",
  "@types/better-sqlite3": "^7.6.13",
  "@tailwindcss/postcss": "^4.1.17",
  "tailwindcss": "^4.1.17",
  "drizzle-kit": "^0.31.9",
  "eslint": "^9.39.1",
  "eslint-config-next": "^16.0.0"
}
```

## File Structure

```
/
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies and scripts
├── bun.lock                # Bun lockfile
├── next.config.ts          # Next.js configuration
├── tsconfig.json           # TypeScript configuration
├── postcss.config.mjs      # PostCSS (Tailwind) config
├── eslint.config.mjs       # ESLint configuration
├── public/                 # Static assets
│   └── .gitkeep
└── src/                    # Source code
    └── app/                # Next.js App Router
        ├── layout.tsx      # Root layout
        ├── page.tsx        # Home page
        ├── globals.css     # Global styles
        └── favicon.ico     # Site icon
```

## Technical Constraints

### Starting Point

- Minimal structure - expand as needed
- Database setup ready (Drizzle + SQLite)
- Auth dependencies added (next-auth)

### Browser Support

- Modern browsers (ES2020+)
- No IE11 support

## Performance Considerations

### Image Optimization

- Use Next.js `Image` component for optimization
- Place images in `public/` directory

### Bundle Size

- Tree-shaking enabled by default
- Tailwind CSS purges unused styles

### Core Web Vitals

- Server Components reduce client JavaScript
- Streaming and Suspense for better UX

## Deployment

### Build Output

- Server-rendered pages by default
- Can be configured for static export

### Environment Variables

Required for production:

- `BATTLENET_CLIENT_ID` - Battle.net OAuth client ID
- `BATTLENET_CLIENT_SECRET` - Battle.net OAuth secret
- `NEXTAUTH_SECRET` - NextAuth encryption key
- `NEXTAUTH_URL` - Production URL

## External API Integration

### Battle.net OAuth

- **Endpoint**: `https://oauth.battle.net`
- **Scope**: `openid profile`
- **Callback**: `/api/auth/callback/battlenet`

### Diablo.tv

- **Purpose**: Fetch DI days and event data
- **Status**: TBD - needs investigation

### DiabloImmortalRedeem.com

- **Purpose**: Character verification via mock redemption
- **Method**: POST to redemption endpoint
- **Expected**: Error codes indicate character status

## Security Considerations

### Authentication

- Battle.net OAuth for user identity
- Character verification required for sync features
- Session management via NextAuth

### Data Protection

- No sensitive game data stored
- Character IDs linked to Battle.net accounts
- User builds stored locally in SQLite
