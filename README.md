# AI2ART 🎨✨

**AI2ART** 是一款基于 **Next.js 15 (App Router)** 和 **React 19** 构建的高性能 AI 照片重绘与艺术创作 SaaS 平台。支持文本生成图像 (Text-to-Image)、照片风格重绘 (Photo Remix)、艺术模板拼接、精细化积分管理 (FIFO) 以及双支付渠道集成，帮助你快速构建并运营生产级的 AI 图像与艺术创作服务。

🌐 **在线演示 / Live Demo**: [https://ai2art.net](https://ai2art.net)

[![Live Demo](https://img.shields.io/badge/Live_Demo-ai2art.net-7c3aed?style=for-the-badge&logo=vercel)](https://ai2art.net)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-c5f74f?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 📸 界面预览 / Preview

![AI2ART Website Preview](public/preview.png)

> ✨ 访问 [ai2art.net](https://ai2art.net) 体验完整在线功能（包含艺术照片重绘、文字生图、模版选择与积分充值流程）。

---

## ✨ 核心特性

### 🎨 AI 图像生成与风格重绘 (Photo Remix)
- **多模型与多提供商支持**：内置对接 MiniMax、Evolink、Ciyuan 等前沿 AI 图像模型。
- **Text-to-Image / Photo Remix 工作流**：支持自定义 Prompt、艺术模板预设、参考图重绘与细节增强。
- **异步生成与任务轮询**：完善的后台任务生命周期追踪（排队、生成中、完成、失败及异常判定处理）。

### 💎 精细化 FIFO 积分管理系统
- **先进先出 (FIFO) 消费机制**：优先扣除即将过期的赠送积分或订阅包积分。
- **三段式事务扣费锁 (Freeze / Settle / Release)**：生成任务发起时即时**冻结 (Freeze)** 积分，成功后**结算 (Settle)** 消耗，若 API 调用或图片处理失败则自动**释放 (Release)** 冻结积分，保障用户资产安全。

### 💳 灵活的双支付集成 (Creem + Stripe)
- **支持 Creem 与 Stripe** 两种独立或并行支付网关。
- **订阅与单次积分包**：支持月付/年付订阅方案及单点积分补充包。
- **自动化 Webhook 充值与同步**。

### 🔐 现代身份验证与权限 (Better Auth)
- **多途径登录**：开箱即用支持 Google OAuth、Magic Link 验证码登录。
- **角色与管理员控制**：内置 Admin 标志，支持后台给特定用户增减积分与日志排查。

### 🌐 国际化与 SEO
- **i18n 多语言支持**：基于 `next-intl` 实现中文/英文无缝切换与路由定位。
- **SEO 与 OpenGraph 优化**：自动生成 Semantic HTML、Meta 标签及适配社交媒体展示。

---

## 🛠 技术栈

| 模块 / 分类 | 使用技术与框架 |
|-----------|----------------|
| **核心框架** | Next.js 15 (App Router), React 19, TypeScript |
| **数据库 & ORM** | PostgreSQL + Drizzle ORM (支持 Neon, Supabase 或自建) |
| **认证组件** | Better Auth + Google OAuth + Email Magic Link |
| **UI & 样式** | Tailwind CSS 4, Radix UI (shadcn/ui), Framer Motion |
| **存储服务** | R2 / S3 兼容对象存储 (`s3mini`) |
| **AI 模型集成** | MiniMax (Core image generation), Evolink, Ciyuan |
| **支付与订阅** | Creem, Stripe |
| **邮件服务** | Resend + React Email 模版渲染 |

---

## 📁 项目结构

```
ai2art/
├── src/
│   ├── ai/                   # AI 服务提供商抽象层 (MiniMax, Evolink, Ciyuan)
│   ├── app/                  # Next.js App Router 路由与 API 端点
│   │   ├── api/              # API 路由 (v1 REST, auth, webhooks)
│   │   └── [locale]/         # i18n 多语言页面 (Marketing, Studio, Dashboard)
│   ├── components/           # React 可复用组件 (Gallery, Studio, UI, Modals)
│   ├── config/               # 积分定价 (credits.ts) 与用户定价方案 (pricing-user.ts)
│   ├── db/                   # Drizzle Schema 与数据库连接实例
│   ├── lib/                  # Auth 模块、R2 存储及基础工具函数
│   ├── payment/              # Stripe & Creem 客户端与 Webhook 逻辑
│   ├── services/             # 核心业务服务 (Credit 积分服务, Image 生成服务)
│   └── stores/               # Zustand 状态管理
├── scripts/                  # 数据库初始化、积分增减、测试与恢复脚本
├── docs/                     # 架构说明与 API 集成指南
└── public/                   # 静态图片、预览图与媒体资源
```

---

## 🚀 快速开始与部署

### 在线体验与一键部署

本仓库可直接连接部署至 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ai2art)

### 本地环境要求

- **Node.js**: `>= 18.0.0`
- **Package Manager**: `pnpm >= 9.0.0`
- **PostgreSQL**: `>= 14.0` (推荐 Neon, Supabase 或自建 PostgreSQL)

### 本地开发步骤

1. **克隆代码库**
   ```bash
   git clone https://github.com/your-username/ai2art.git
   cd ai2art
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   ```
   根据 `.env.example` 中的注释，配置你的 `DATABASE_URL`、`BETTER_AUTH_SECRET`、`MINIMAX_API_KEY` 及存储密钥。

4. **同步数据库 Schema**
   ```bash
   pnpm db:push
   ```

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```

   访问 [http://localhost:3000](http://localhost:3000) 即可在本地体验 AI2ART 平台。

---

## 📝 环境变量配置参考

在 `.env.local` 中配置核心环境变量：

```env
# -----------------------------------------------------------------------------
# 数据库 (PostgreSQL)
# -----------------------------------------------------------------------------
DATABASE_URL='postgresql://user:password@host:port/database?sslmode=require'

# -----------------------------------------------------------------------------
# 应用与认证 (Better Auth)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL='https://ai2art.net'
BETTER_AUTH_URL='https://ai2art.net'
BETTER_AUTH_SECRET='your_generated_secret_32bytes'

# Google OAuth
GOOGLE_CLIENT_ID='your_google_client_id'
GOOGLE_CLIENT_SECRET='your_google_client_secret'

# -----------------------------------------------------------------------------
# AI 服务 (MiniMax / Evolink)
# -----------------------------------------------------------------------------
MINIMAX_API_KEY='your_minimax_api_key'
MINIMAX_API_URL='https://api.minimaxi.com/v1'

# -----------------------------------------------------------------------------
# R2 / S3 存储
# -----------------------------------------------------------------------------
STORAGE_ENDPOINT='https://xxx.r2.cloudflarestorage.com'
STORAGE_ACCESS_KEY='your_r2_access_key'
STORAGE_SECRET_KEY='your_r2_secret_key'
STORAGE_BUCKET='your_bucket_name'
STORAGE_DOMAIN='https://pub-xxx.r2.dev'

# -----------------------------------------------------------------------------
# 支付渠道 (Creem / Stripe)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_BILLING_PROVIDER='creem'
CREEM_API_KEY='creem_sk_xxx'
CREEM_WEBHOOK_SECRET='whsec_xxx'
```

---

## 🛠 开发与运维常用脚本

项目内置了丰富的手工治理与自动化运维脚本（位于 `scripts/`）：

```bash
# 给予用户特定积分 (支持添加备注)
pnpm script:add-credits user@example.com 100 "管理员赠送积分"

# 查询指定用户的积分资产与冻结状态
pnpm script:check-credits user@example.com

# 重置用户积分
pnpm script:reset-credits user@example.com --confirm

# 初始化画廊/预设艺术模版数据
pnpm script:seed-classic-images
```

---

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。您可以自由学习、分发及用于商业用途。

---

## 🙏 致谢

感谢以下优秀开源技术栈与服务提供方对本项目的支持：

- [Next.js](https://nextjs.org/) & [React](https://react.dev/) - 现代化 Web 应用架构
- [Drizzle ORM](https://orm.drizzle.team/) - 类型安全且极速的数据库 ORM
- [Better Auth](https://www.better-auth.com/) - 简便安全的全栈认证解决方案
- [shadcn/ui](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/) - 优雅可扩展的 UI 组件与样式库
- [MiniMax](https://platform.minimaxi.com/) - 强劲的 AI 图像生成与多模态模型能力
