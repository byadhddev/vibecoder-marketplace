# VibeCoder Marketplace

**Ship Fast. Get Found. Get Paid.**

The marketplace where vibe coders who build with AI meet founders who need it done. Browse live projects, see real speed, hire with confidence.

> Every token burned should build something someone needs.

---

## What Is This?

VibeCoder is a plug-and-play marketplace for AI-powered developers ("vibe coders") to showcase their work and get hired. Unlike traditional freelance platforms:

- **Proof of Work** — Not portfolios. Live, running projects with URLs
- **Speed as Reputation** — "Built in 6 hours" badges that prove AI-powered velocity
- **No Bidding Wars** — Builders set their rate. Seekers accept or browse on
- **Vibe-First Discovery** — Tile grid, avatar colors, personality. Not faceless contractor profiles
- **Fully Transparent** — All hire requests, reviews, and feedback are public GitHub Issues
- **Zero Database Servers** — Everything runs on GitHub branches, Issues, and Discussions

---

## Architecture

### Branch-Based GitHub Backend

VibeCoder has **no database server**. All data lives in a single GitHub repository (`GITHUB_DATA_REPO`) using branches as isolated data stores:

```
byadhddev/vibecoder-marketplace (data repo)
├── registry          ← Global index branch
│   └── users.json    ← All registered users (username, name, avatar_url, skills)
│
├── user/alice         ← Alice's personal data branch (orphan)
│   ├── profile.json   ← Profile data (role, skills, rate, social links)
│   ├── showcases/
│   │   ├── ai-dashboard.json
│   │   └── chatbot-mvp.json
│   └── earnings.json  ← Self-reported earnings log
│
├── user/bob           ← Bob's personal data branch (orphan)
│   ├── profile.json
│   ├── showcases/
│   └── earnings.json
│
└── Issues & Discussions  ← Transparent hire requests, reviews, feedback
```

### How User Isolation Works

Each user gets an **orphan branch** (`user/{username}`) — a branch with no common ancestor to any other branch. This means:

1. **Complete isolation** — Alice cannot see or modify Bob's data at the Git level
2. **No merge conflicts** — Branches never intersect
3. **Per-user history** — Every change to a user's profile/showcases is a Git commit with full audit trail
4. **Atomic writes** — GitHub's Contents API handles concurrency via SHA-based optimistic locking

The orphan branch is created on first login:

```
createOrphanBranch("user/alice")
  → Create blob (empty JSON)
  → Create tree with .init file
  → Create commit with NO parents (orphan)
  → Create ref pointing to commit
```

### The Registry

A global `users.json` on the `registry` branch acts as the index:

```json
{
  "users": [
    { "username": "alice", "name": "Alice", "avatar_url": "...", "skills": ["React", "Next.js"], "available_for_hire": true },
    { "username": "bob", "name": "Bob", "avatar_url": "...", "skills": ["Python"], "available_for_hire": false }
  ]
}
```

This is read by the explore page, leaderboard, search, and sitemap generator.

### GitHub Issues as Data Layer

All interactive data (hire requests, feedback, reviews, endorsements) uses **GitHub Issues** on the data repo:

| Feature | Issue Title Pattern | Labels |
|---------|-------------------|--------|
| Hire Request | `[Hire] seeker → builder: description` | `hire-request`, `builder:{username}`, `skill:*`, `budget:*` |
| Showcase Feedback | `[Feedback] title by builder` | `showcase-feedback`, `builder:{username}`, `showcase:{slug}` |
| Review | `[Review] reviewer → builder: ⭐⭐⭐⭐⭐` | `review`, `builder:{username}`, `stars:{n}` |
| Endorsement | `[Endorse] @user endorses "title"` | `endorsement`, `builder:{username}`, `showcase:{slug}` |

**Why Issues?**
- Builders get **free GitHub notifications** on every hire request
- Everything is **publicly auditable** — no hidden data
- Seekers can **track their request** on GitHub
- Issue comments enable **threaded conversations**
- Labels enable **filtering and search** via GitHub's API

---

## Analytics & Tracking

### What's Tracked

| Metric | How | Self-Tracking |
|--------|-----|---------------|
| **Profile Views** | `POST /api/marketplace/track` with `type: page_view` | ❌ Excluded |
| **Showcase Views** | `POST /api/marketplace/track` with `type: view` | ❌ Excluded |
| **Showcase Clicks** | `POST /api/marketplace/track` with `type: click` | ❌ Excluded |
| **Referrer** | Captured from `referer` header | — |
| **User Agent** | Captured from `user-agent` header | — |

### Self-Tracking Exclusion

The track API checks the current session. If the logged-in user is viewing their own profile or clicking their own showcase, the event is silently discarded:

```typescript
const currentUser = session?.user?.username;
if (type === 'page_view' && currentUser === username) return; // skip
if (type === 'click' && currentUser === owner) return;        // skip
```

### Where Analytics Are Stored

View and click counts are stored in the user's showcase JSON files and profile JSON, incremented via the GitHub Contents API (read → increment → write with SHA).

---

## GitHub OAuth

### How Authentication Works

1. User clicks "Sign in with GitHub" → redirected to GitHub OAuth
2. GitHub returns with auth code → exchanged for access token
3. NextAuth JWT callback:
   - Stores `accessToken` and `username` in the JWT
   - **Auto-creates profile** on first login (creates orphan branch + profile.json + registry entry)
4. Session enriched with `username` and `accessToken`

### OAuth Scopes

```
read:user     → Read user profile (name, avatar, email)
public_repo   → Read/write public repo contents (for data repo operations)
```

### Token Hierarchy

```
User's OAuth token  → Used for user-specific write operations
GITHUB_APP_TOKEN    → Used for read operations and Issue creation
GITHUB_CLIENT_SECRET → Fallback if GITHUB_APP_TOKEN not set
```

---

## Features

### For Builders (Vibe Coders)

- **Profile page** (`/m/{username}`) — Tile-based showcase of work, skills, rate, badges
- **Showcase CRUD** — Add live projects with title, URL, description, build hours, AI tools used
- **Manager dashboard** (`/manager`) — Edit profile, manage showcases, view requests, log earnings
- **Onboarding wizard** (`/manager/onboard`) — 4-step guided setup for new users
- **Badge system** — ⚡ Fast Shipper, 🏆 Top 10, 💰 Earner, 🚀 Prolific, 🔁 Repeat Hired
- **Response time tracking** — Average time to respond to hire requests (from Issue comments)
- **Share tile** — Copy link, embed code, Twitter/LinkedIn share, native mobile share
- **Email digests** — Weekly summary of views, hire requests, reviews, leaderboard position

### For Seekers (Founders / Businesses)

- **Explore page** (`/explore`) — Browse showcases and builders, filter by skill/availability
- **Contact form** — Send hire requests (becomes a public GitHub Issue)
- **Reviews** — Leave star ratings and reviews (public via GitHub Issues)
- **Leaderboard** (`/leaderboard`) — Find top builders by showcases shipped and views

### Platform

- **Search** (`/search` + ⌘K) — Full-text search across builders, showcases, skills, tags
- **Admin dashboard** (`/admin`) — Platform stats, builder list, GitHub API health check
- **SEO** — Dynamic sitemap, per-page metadata, JSON-LD schemas, per-showcase OG images
- **Email notifications** — Instant hire request alerts + weekly digests via Resend

---

## API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/[...nextauth]` | GET, POST | GitHub OAuth authentication |
| `/api/marketplace/profile` | GET, POST | Read/update builder profile |
| `/api/marketplace/showcases` | GET, POST, PUT, DELETE | Showcase CRUD |
| `/api/marketplace/contact` | GET, POST, PUT | Hire requests (GitHub Issues) |
| `/api/marketplace/explore` | GET | Browse showcases + builders |
| `/api/marketplace/explore/requests` | GET | Recent open hire requests |
| `/api/marketplace/search` | GET | Full-text search |
| `/api/marketplace/track` | POST | Analytics (views, clicks) |
| `/api/marketplace/feedback` | GET, POST | Showcase feedback (Issues) |
| `/api/marketplace/reviews` | GET, POST | Builder reviews (Issues) |
| `/api/marketplace/endorse` | POST | Showcase endorsements (Issues) |
| `/api/marketplace/badges` | GET | Computed builder badges |
| `/api/marketplace/response-time` | GET | Avg hire request response time |
| `/api/marketplace/earnings` | GET, POST | Earnings log |
| `/api/marketplace/discussions` | GET | GitHub Discussions feed |
| `/api/marketplace/vibelopers` | GET | Vibeloper card data |
| `/api/marketplace/og` | POST | Fetch OG metadata from URL |
| `/api/og` | GET | Dynamic OG image generation |
| `/api/admin` | GET | Platform stats (admin only) |
| `/api/cron/weekly-digest` | POST | Weekly email digest (cron) |

---

## Design System

The UI follows the **Artode lab** tile-based design:

- **Fonts:** Inter (body) + Playfair Display (headings) via `next/font/google`
- **Colors:** `--brand-accent: #D80018` (swiss red), foreground `#1c1917`, muted `#78716c`
- **Layout:** Paper-themed `PageShell` with grid background, `max-w-4xl` centered
- **Grid:** `grid-cols-2 md:grid-cols-4 gap-px` — 2 columns mobile, 4 desktop, 1px borders
- **Vibe Mode:** Hover/click the artode square to activate avatar-extracted color palettes
- **Avatar Colors:** Extracted from user avatars at runtime, applied to tile backgrounds and text

---

## Badge System

Badges are computed from builder data:

| Badge | Criteria |
|-------|----------|
| ⚡ Fast Shipper | Avg build hours < 24 AND 3+ showcases with build_hours |
| 🏆 Top 10 | Leaderboard rank ≤ 10 |
| 💰 Earner | Total earned > $0 |
| 🚀 Prolific | 5+ published showcases |
| 🔁 Repeat Hired | 1+ seekers with 3+ hire requests |

Badges are computed server-side via `/api/marketplace/badges` (includes GitHub Issues data for Repeat Hired).

---

## Email System

Powered by [Resend](https://resend.com) (free tier: 100 emails/day).

### Email Types

1. **Weekly Digest** — Sent every Monday via `/api/cron/weekly-digest`
   - New views, hire requests, reviews, endorsements
   - Leaderboard position
   - Link to dashboard

2. **Instant Hire Notification** — Sent immediately when a seeker submits a contact form
   - Seeker name, project description
   - Direct link to GitHub Issue

### Email Preferences

Builders can toggle `email_notifications` in their Manager profile. Set to `true` by default.

### Cron Setup

For Vercel deployment, add to `vercel.json`:
```json
{ "crons": [{ "path": "/api/cron/weekly-digest", "schedule": "0 9 * * 1" }] }
```

Or trigger externally with:
```bash
curl -X POST https://your-domain.com/api/cron/weekly-digest \
  -H "Authorization: Bearer $CRON_SECRET"
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A GitHub OAuth App
- A GitHub repository for data storage (can be the same repo or a separate one)

### 1. Clone & Install

```bash
git clone https://github.com/byadhddev/vibecoder-marketplace.git
cd vibecoder-marketplace
npm install
```

### 2. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set:
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret

### 3. Set Up the Data Repository

Create a new public GitHub repository (e.g., `your-username/vibecoder-data`). This will store all user data. The app creates branches and files automatically.

### 4. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret

# Data repository (owner/repo format)
GITHUB_DATA_REPO=your-username/vibecoder-data

# GitHub token for server-side operations (Personal Access Token with repo scope)
GITHUB_APP_TOKEN=ghp_your_personal_access_token

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_random_secret

# Admin (comma-separated GitHub usernames)
ADMIN_USERNAMES=your-github-username

# Email (optional — skip for local dev)
RESEND_API_KEY=re_your_resend_key
EMAIL_FROM=VibeCoder <notifications@vibecoder.com>

# Cron auth (optional)
CRON_SECRET=your_cron_secret
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. First Steps

1. Click "Sign in with GitHub"
2. You'll be redirected to the onboarding wizard
3. Fill in your profile, add your first showcase, set your rate
4. Visit `/m/your-username` to see your public profile
5. Visit `/admin` to see the platform dashboard (if your username is in `ADMIN_USERNAMES`)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home/landing page
│   ├── layout.tsx                  # Root layout (fonts, metadata, SessionProvider)
│   ├── sitemap.ts                  # Dynamic sitemap generator
│   ├── explore/                    # Browse showcases & builders
│   ├── leaderboard/                # Top builders ranked
│   ├── search/                     # Full-text search page
│   ├── login/                      # GitHub OAuth login
│   ├── manager/                    # Builder dashboard
│   │   ├── page.tsx                # Main manager
│   │   └── onboard/page.tsx        # 4-step onboarding wizard
│   ├── admin/                      # Admin dashboard (protected)
│   ├── m/[username]/               # Public builder profile
│   │   ├── page.tsx                # Profile page (SSR + JSON-LD)
│   │   ├── MarketplaceGrid.tsx     # Tile grid renderer (~700 lines)
│   │   └── [slug]/page.tsx         # Showcase detail page
│   ├── v/[username]/embed/         # Embeddable vibeloper card
│   └── api/
│       ├── auth/                   # NextAuth routes
│       ├── og/                     # Dynamic OG image generation
│       ├── admin/                  # Admin stats API
│       ├── cron/                   # Scheduled jobs
│       └── marketplace/            # All marketplace APIs
│
├── components/layout/
│   ├── Header.tsx                  # Nav, search, mobile menu, ⌘K overlay
│   ├── Footer.tsx                  # Site footer
│   └── PageShell.tsx               # Paper-themed page wrapper
│
├── lib/
│   ├── github/
│   │   ├── client.ts              # Low-level GitHub API (branches, read/write JSON)
│   │   ├── queries.ts             # Business logic (profiles, showcases, earnings)
│   │   └── issues.ts              # Issues API (hire requests, reviews, endorsements)
│   ├── db/types.ts                # TypeScript interfaces (Profile, Showcase, Earning)
│   ├── vibe.ts                    # Design system constants (colors, grid, shuffle)
│   ├── colors.ts                  # Avatar color extraction
│   ├── badges.ts                  # Badge computation
│   ├── admin.ts                   # Admin auth check
│   └── email/send.ts              # Resend email templates + send functions
│
├── auth.ts                        # NextAuth v5 config (GitHub provider)
└── styles/globals.css             # Tailwind + custom properties
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add all environment variables
4. Add cron job for weekly digest in `vercel.json`
5. Deploy

### Other Platforms

Works on any platform that supports Next.js 15 (Node.js runtime). The edge runtime is only used for OG image generation.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Auth | NextAuth v5 (GitHub OAuth) |
| Data | GitHub REST API (branches + Issues) |
| Email | Resend |
| Fonts | Inter + Playfair Display (Google Fonts) |
| OG Images | `next/og` (Satori + Edge Runtime) |
| Deployment | Vercel (recommended) |

---

## License

MIT
