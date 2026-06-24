# AI2ART - AI Photo Remix and Art Generation Platform

## Project Overview

AI2ART is a SaaS platform for AI-powered photo remix and art generation. It's built as a standalone Next.js application with AI image generation and video generation capabilities.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript
- **Database**: PostgreSQL with **Drizzle ORM**
- **Auth**: Better Auth + Google OAuth + Magic Link
- **Styling**: Tailwind CSS 4 + shadcn/ui (Radix UI)
- **Package Manager**: pnpm

## Project Structure

```
ai2art/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/              # API Routes
│   │   │   ├── v1/           # REST API v1
│   │   │   ├── auth/         # Better Auth endpoints
│   │   │   └── webhooks/     # Webhooks (Stripe, Creem)
│   │   └── [locale]/         # i18n pages (marketing, dashboard, tool)
│   ├── ai/                   # AI provider abstraction
│   │   ├── images/           # Image generation (MiniMax, Evolink, CIYUAN)
│   │   └── providers/         # Video generation providers (evolink, kie)
│   ├── components/           # React components
│   │   ├── gallery/          # Gallery components
│   │   ├── studio/           # Studio remix components
│   │   └── ...
│   ├── config/               # Configuration
│   ├── db/                   # Database
│   │   └── schema.ts         # Drizzle schema
│   ├── services/             # Business services
│   │   ├── image/            # Image generation service
│   │   │   ├── gallery.ts    # Gallery image management
│   │   │   ├── generation-jobs.ts
│   │   │   └── ...
│   │   └── credit.ts         # Credit system
│   ├── lib/                  # Utilities
│   └── stores/               # Zustand state stores
├── scripts/                  # Utility scripts (gallery generation)
├── public/images/            # Gallery images (gallery-*.png)
└── docs/                     # Documentation
```

## Critical Image Generation Invariant

Text-to-image and Remix must use `gpt-image-2` with `1024x1024`, `quality: low`, JPEG output, and a one-credit cost. Enforce this invariant in the server/provider request; frontend defaults alone are not sufficient.

Do not restore 2K/4K, PNG, variable quality, or variable output ratios unless the execution infrastructure is first changed to support slower jobs safely. Vercel post-response work is still bounded by the function's `maxDuration`, so all persisted image jobs must retain stale-job failure and credit-release recovery.

## Core Modules

### 1. AI Provider Layer (`src/ai/`)

Unified abstraction for multiple AI generation providers.

**Supported Image Providers:**
- **MiniMax** - Core provider
- **Evolink** - Secondary provider
- **Ciyuan** - Secondary provider

### 2. Credit System (`src/services/credit.ts`)

FIFO-based credit management with freeze/settle/release pattern.

**Key Methods:**
- `getBalance(userId)` - Get available/frozen/used credits
- `freeze({ userId, credits, videoUuid })` - Freeze credits for task
- `settle(videoUuid)` - Confirm credit consumption
- `release(videoUuid)` - Release frozen credits on failure
- `recharge({ userId, credits, orderNo, transType })` - Add credits from purchase

### 3. Image Generation Service (`src/services/image/`)

Handles the asynchronous image generation job lifecycle, tracking status, saving generated results, and uploading outputs to R2.

### 4. Storage (`src/lib/storage.ts`)

R2/S3-compatible storage for image assets and user uploads.

## UI/UX & Layout Invariants

### 1. Homepage Hero Section
- **Upper Grid**: Consists of a text content column on the left (badge, title, description, trust badges) and a floating image deck on the right.
- **Floating Image Deck**: Must contain **exactly 4 case image cards** (`hero-card-1` to `hero-card-4`).
  - Cards must use theme-adaptive styles (white backgrounds in light mode, dark slate `#0f172a` in dark mode).
  - Drift animation keyframes must preserve the cards' tilted angles (`rotate(var(--tilt))`).
  - Stacking order is explicitly controlled by z-indexes. Hover state pauses animation and lifts the cards with a spring-like cubic-bezier transition.
- **Lower CTA Block**: Positioned directly below the upper grid with a top margin of `mt-12 lg:mt-16` for breathing room. Features centered buttons and 3 equal-width advantage cards (`md:grid-cols-3`).

### 2. Studio Text-to-Image tab (`text-to-image.tsx`)
- **Right Sidebar**: Shows selected template image.
- **"Change" (换一个) Button**: Displayed next to the template header if `selectedTemplate` is active, allowing direct access to the picker dialog.
- **Prompt Starters (提示词风格) Card**: Rendered conditionally; **must be hidden** when a template is active to keep the workspace clean and focused.
- **Query Parameter Loading**: Pre-loads template prompt and selected template state using the URL slug parameter `?template=slug`.

## Database Schema

### Key Tables

```sql
-- Users (Better Auth)
user (
  id, name, email, email_verified, image,
  is_admin, created_at, updated_at
)

-- Credit packages (FIFO consumption with expiration)
credit_packages (
  id, user_id, initial_credits, remaining_credits,
  frozen_credits, trans_type, order_no, status,
  expired_at, created_at, updated_at
)

-- Frozen credits holds
credit_holds (
  id, user_id, video_uuid, credits, status,
  package_allocation, package_id, created_at, settled_at
)

-- Credit transactions history
credit_transactions (
  id, trans_no, user_id, trans_type, credits,
  balance_after, package_id, video_uuid, order_no,
  hold_id, remark, created_at
)

-- Classic Images (Templates)
classic_images (
  id, slug, title, description, category, subcategory,
  prompt_template, hero_image_url, thumbnail_url,
  is_active, created_at, updated_at
)

-- Image Generation Jobs
image_generation_jobs (
  id, user_id, type, status, classic_image_id, prompt,
  source_image_key, result_image_key, result_image_url,
  credits_used, error_message, parameters,
  created_at, updated_at, completed_at
)

-- Payment
customers (
  id, auth_user_id, name, plan, stripe_customer_id,
  stripe_subscription_id, stripe_price_id,
  stripe_current_period_end, created_at, updated_at
)

creem_subscriptions (
  id, user_id, product_id, subscription_id, status,
  current_period_end, created_at, updated_at
)
```

## Frontend Pages

Route groups with `(locale)`:

| Route Group | Path | Description |
|-------------|------|-------------|
| `(marketing)` | `/[lang]/` | Landing page |
| `(marketing)` | `/[lang]/pricing` | Pricing page |
| `(marketing)` | `/[lang]/gallery` | Image templates gallery |
| `(dashboard)` | `/[lang]/dashboard` | User dashboard |
| `(auth)` | `/[lang]/login` | Login page |
| `(auth)` | `/[lang]/register` | Registration |
| `(admin)` | `/[lang]/admin` | Admin panel |

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=...

# Auth
BETTER_AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Storage (R2/S3)
STORAGE_ENDPOINT=...
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
STORAGE_BUCKET=...
STORAGE_DOMAIN=...

# AI Providers
EVOLINK_API_KEY=...
KIE_API_KEY=...
MINIMAX_API_KEY=...          # For image generation
MINIMAX_API_URL=...         # Optional, defaults to api.minimaxi.com
AI_CALLBACK_URL=https://your-domain.com/api/v1/video/callback
AI_CALLBACK_SECRET=...

# Payment - Creem (Primary)
CREEM_API_KEY=...
CREEM_WEBHOOK_SECRET=...

# Payment - Stripe (Secondary)
STRIPE_API_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Email
RESEND_FROM=...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Database operations
pnpm db:generate   # Generate migrations
pnpm db:migrate    # Run migrations
pnpm db:push       # Push schema (dev only)
pnpm db:studio     # Open Drizzle Studio

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Formatting
pnpm format

# Run scripts
pnpm script:add-credits   # Add credits to user
pnpm script:check-credits # Check user credits
pnpm script:reset-credits # Reset user credits
```

## Gallery Image Template Generation

The gallery feature allows users to select famous landmarks/travel destinations as photo remix templates. Images are generated using MiniMax image generation API and stored in `public/images/` with database records in `classic_images` table.

### Image Generation Flow

1. **Write prompts** following the template below
2. **Generate images** using MiniMax API via `scripts/generate-new-gallery-images.ts`
3. **Insert to database** using `scripts/insert-new-gallery-images.ts`
4. **Commit to GitHub** with the new images

### Prompt Template

```
[Landmark name] in [Country/City] completely empty of people, bright clear sunny [region] midday with crystal blue sky, [detailed landmark description], a [marked position/platform/terrace] where visitors normally stand for photos but currently empty, [additional architectural/natural details], warm [regional] sunlight, eye-level perspective from a standing photographer, 16:9 hyperrealistic travel photography, empty tourist attraction no humans
```

### Prompt Requirements

**Strict Rules:**
- **NO people** - The scene must be completely empty
- **Photographer perspective** - Eye-level from standing position (approximately 170cm height)
- **Bright sunny midday** - Crystal clear blue sky, strong sunlight
- **Designated photo spot** - Include a visible marker/platform where tourists normally stand
- **Famous landmarks** - Must be well-known打卡景点 (tourist check-in spots)
- **No humans in image** - No silhouettes, shadows, or any human presence

**Content Rules:**
- Generated from photographer's standing eye-level
- Must预留 a "photo spot" position for user to composite their photo
- Focus on iconic architecture/landscape features
- Use specific location details (e.g., "Victoria Memorial in front of Buckingham Palace")

### Image Storage

- **Image files**: `public/images/gallery-{slug}.png` (16:9 aspect ratio)
- **Database**: `classic_images` table
- **Slug format**: `{country}-{location}` (e.g., `uk-london`, `japan-fuji`)

### Database Schema

```sql
classic_images (
  id, slug, title, description,
  category, subcategory,
  prompt_template, hero_image_url, thumbnail_url,
  is_active, created_at, updated_at
)
```

### Scripts

**Generate images:**
```bash
MINIMAX_API_KEY="your-api-key" npx tsx scripts/generate-new-gallery-images.ts
```

**Insert to database:**
```bash
# Set DATABASE_URL from .env first
export $(grep DATABASE_URL .env | xargs)
npx tsx scripts/insert-new-gallery-images.ts
```

**Update existing records (upsert):**
The insert scripts use insert-or-update pattern to ensure new images replace old records correctly.

### Existing Categories

Gallery categories are country-based. Current categories include:
- Europe: Sweden, Denmark, Croatia, Hungary, Slovenia, Romania, Bulgaria, Latvia, Estonia, Malta, UK, Greece, Italy, France, Germany, Austria, Poland, Czech, Portugal, Russia, Finland, Ireland, Belgium, Netherlands
- Southeast Asia: Cambodia, Myanmar, Malaysia, Singapore, Philippines, Thailand, Indonesia, Vietnam, Japan
- Middle East: UAE, Israel, Saudi Arabia, Qatar, Lebanon, Oman, Bahrain, Macau, Jordan, Turkey
- Africa: Egypt, Morocco, South Africa, Tanzania
- Americas: USA, Brazil, Mexico, Peru, Canada, Australia
- Central Asia: Georgia, Armenia, Azerbaijan, Kazakhstan, Uzbekistan

**Do NOT create new categories** - use existing country categories only.

---

## Architecture Decisions

1. **Drizzle ORM over Kysely/Prisma** - Better TypeScript inference, lighter runtime, simpler migrations
2. **Single package over Turborepo** - Simpler project structure for this scale
3. **REST API over tRPC for new features** - Simpler for webhook integrations, Better Auth compatibility
4. **Creem as primary payment** - Better developer experience with better-auth plugin
5. **FIFO credit consumption** - Fair expiration handling across multiple packages
6. **Callback-based AI integration** - Async generation with webhook completion
7. **R2 storage** - Cost-effective video storage with CDN
8. **Route groups for page organization** - Clean separation of marketing/dashboard/tool/auth/admin pages
