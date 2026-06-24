# AI2ART - AI Photo Remix & Art Generator

## Project Overview

AI2ART is a SaaS platform for AI-powered photo remixing and art generation. It is built as a standalone Next.js application using advanced AI models.

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
│   │   └── providers/        # Video generation providers (evolink, kie)
│   ├── components/           # React components
│   │   ├── gallery/          # Gallery grid and cards
│   │   ├── studio/           # Studio workbenches (text-to-image, remix)
│   │   └── ...
│   ├── config/               # Configuration
│   │   ├── credits.ts        # Credit/Model pricing config
│   │   └── pricing-user.ts   # User-facing pricing config
│   ├── db/                   # Database
│   │   ├── schema.ts         # Drizzle schema
│   │   └── index.ts
│   ├── lib/                  # Utilities
│   │   ├── auth/             # Better Auth configuration
│   │   ├── storage.ts        # R2/S3 storage
│   │   └── ...
│   ├── payment/              # Payment integration
│   │   ├── index.ts          # Stripe client
│   │   ├── plans.ts          # Subscription plans
│   │   └── webhooks.ts       # Stripe webhooks
│   ├── services/             # Business services
│   │   ├── credit.ts         # Credit system (freeze/settle/release)
│   │   ├── image/            # Image generation services
│   │   └── billing.ts
│   ├── stores/               # Zustand state stores
│   ├── hooks/                # React hooks
│   ├── i18n/                 # Internationalization
│   └── middleware.ts
├── scripts/                  # Utility scripts
├── docs/                     # Documentation
└── public/                   # Static assets
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
