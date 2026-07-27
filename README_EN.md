[English](./README_EN.md) | [简体中文](./README.md)

# AI2ART 🎨✨

**AI2ART** is a production-grade AI photo remixing and art generation SaaS platform built with **Next.js 15 (App Router)** and **React 19**. It features Text-to-Image generation, Photo Remixing, preset art style templates, fine-grained FIFO credit system, and dual payment provider integration.

> 🌐 **Official Live Platform**: [https://ai2art.net](https://ai2art.net/)  
> 💡 Visit [AI2ART Official Site](https://ai2art.net/) to try out AI photo remixing and art generation for free!

[![Live Platform](https://img.shields.io/badge/🌐_Official_Site-ai2art.net-059669?style=for-the-badge&logo=vercel)](https://ai2art.net/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-c5f74f?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 📸 Screenshots

> 🚀 **Try it Live**: Visit [ai2art.net](https://ai2art.net/) to experience the live application built with this template!

### Homepage
![AI2ART Homepage Screenshot](public/preview.png)

### Photo Remix Studio
![AI2ART Photo Remix Studio Screenshot](public/preview-remix.png)

---

## ✨ Features

### 🎨 AI Image Generation & Photo Remix
- **Multi-Provider Support**: Seamlessly integrated with MiniMax, Evolink, and Ciyuan models.
- **Text-to-Image / Photo Remix Workflows**: Supports prompt customization, art style presets, image-to-image remixing, and enhancement.
- **Async Job & Polling**: Robust background task tracking with state handling (queued, processing, completed, failed with automatic recovery).

### 💎 Advanced FIFO Credit Management
- **First-In-First-Out (FIFO) Consumption**: Prioritizes consuming credits closest to expiration date.
- **3-Stage Transaction Hold (Freeze / Settle / Release)**: Freezes credits instantly when initiating a generation task, settles upon success, and releases held credits automatically if provider API fails, ensuring user asset safety.

### 💳 Dual Payment Integration (Creem + Stripe)
- Supports both **Creem** and **Stripe** payment gateways.
- Monthly & yearly subscriptions alongside one-time credit top-up packages.
- Automated Webhook synchronization.

### 🔐 Authentication & Access Control (Better Auth)
- **Multi-method Auth**: Google OAuth and Email Magic Link out-of-the-box.
- **Role & Admin Governance**: Built-in admin flags for managing credit top-ups and system logs.

### 🌐 Internationalization & SEO
- **Full i18n**: Powered by `next-intl` with English & Chinese localization.
- **SEO Ready**: Automatic Meta tags, Semantic HTML, and OpenGraph social card optimization.

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Core Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Database & ORM** | PostgreSQL + Drizzle ORM (Neon, Supabase, or Self-hosted) |
| **Authentication** | Better Auth + Google OAuth + Email Magic Link |
| **UI & Styling** | Tailwind CSS 4, Radix UI (shadcn/ui), Framer Motion |
| **Storage** | Cloudflare R2 / S3 Compatible Storage (`s3mini`) |
| **AI Providers** | MiniMax, Evolink, Ciyuan |
| **Payments** | Creem, Stripe |
| **Transactional Email**| Resend + React Email |

---

## 📁 Project Structure

```
ai2art/
├── src/
│   ├── ai/                   # AI Provider Abstraction (MiniMax, Evolink, Ciyuan)
│   ├── app/                  # Next.js App Router & API Routes
│   │   ├── api/              # API Endpoints (v1 REST, auth, webhooks)
│   │   └── [locale]/         # i18n Pages (Marketing, Studio, Dashboard)
│   ├── components/           # Reusable UI Components
│   ├── config/               # Pricing & Credit Package Configurations
│   ├── db/                   # Drizzle Schema & Connection
│   ├── lib/                  # Auth, Storage & Helper utilities
│   ├── payment/              # Stripe & Creem SDK & Webhooks
│   ├── services/             # Business Logic (Credit Engine, Image Services)
│   └── stores/               # Zustand state management
├── scripts/                  # Database Seed & Admin Utility Scripts
├── docs/                     # Documentation & API Guides
└── public/                   # Static assets & Preview images
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `>= 18.0.0`
- **Package Manager**: `pnpm >= 9.0.0`
- **PostgreSQL Database**: `>= 14.0`

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai2art.git
   cd ai2art
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your `DATABASE_URL`, `BETTER_AUTH_SECRET`, `MINIMAX_API_KEY`, and R2 storage credentials.

4. **Sync Database Schema**
   ```bash
   pnpm db:push
   ```

5. **Run Development Server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view your local AI2ART application.

---

## 📝 Environment Variables Reference

Example configuration for `.env.local`:

```env
# Database (PostgreSQL)
DATABASE_URL='postgresql://user:password@host:port/database?sslmode=require'

# App & Better Auth
NEXT_PUBLIC_APP_URL='http://localhost:3000'
BETTER_AUTH_URL='http://localhost:3000'
BETTER_AUTH_SECRET='your_generated_secret_32bytes'

# Google OAuth
GOOGLE_CLIENT_ID='your_google_client_id'
GOOGLE_CLIENT_SECRET='your_google_client_secret'

# AI Providers
MINIMAX_API_KEY='your_minimax_api_key'
MINIMAX_API_URL='https://api.minimaxi.com/v1'

# Storage (R2 / S3)
STORAGE_ENDPOINT='https://xxx.r2.cloudflarestorage.com'
STORAGE_ACCESS_KEY='your_r2_access_key'
STORAGE_SECRET_KEY='your_r2_secret_key'
STORAGE_BUCKET='your_bucket_name'
STORAGE_DOMAIN='https://pub-xxx.r2.dev'

# Payments (Creem / Stripe)
NEXT_PUBLIC_BILLING_PROVIDER='creem'
CREEM_API_KEY='creem_sk_xxx'
CREEM_WEBHOOK_SECRET='whsec_xxx'
```

---

## 🛠 Admin & Utility Scripts

Included in `scripts/` for operational management:

```bash
# Add credits to a user with custom remarks
pnpm script:add-credits user@example.com 100 "Admin Gift"

# Inspect user credit balances and active holds
pnpm script:check-credits user@example.com

# Reset user credits
pnpm script:reset-credits user@example.com --confirm

# Seed classic art style templates into database
pnpm script:seed-classic-images
```

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) & [React](https://react.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/)
- [shadcn/ui](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/)
- [MiniMax](https://platform.minimaxi.com/)
