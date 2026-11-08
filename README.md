# Pizza Demo by Novixa — Digital Ordering & Restaurant Operations Platform
> A [Novixa](https://novixa.dev) product · Live demo restaurant: **Pizza Nova (بيتزا نوڤا)**, Mukalla, Hadhramaut, Yemen
>
> 🌐 **Live demo:** https://pizza-demo.novixa.dev · [![Deploy](https://github.com/Novixa-dev/pizza-demo/actions/workflows/deploy.yml/badge.svg)](https://github.com/Novixa-dev/pizza-demo/actions/workflows/deploy.yml)

---

## 🍕 Overview

**Pizza Demo** is a production-grade digital pre-ordering and kitchen operations platform built specifically for the operational reality of Mukalla, Yemen. It addresses the primary friction of in-store dining and takeaway: **eliminating customer waiting times (15–25 minutes) through an Intelligent Scheduled Preparation Engine**.

### Core Value Proposition
- **Scheduled Preparation Engine**: Automatically calculates oven release time based on customer pickup schedule ($T_{\text{release}} = T_{\text{pickup}} - T_{\text{prep}}$) to ensure pizza comes out of the oven sizzling hot at the exact minute the customer arrives.
- **Arabic-First, RTL Native UX**: Built with warm, premium appetite-stimulating aesthetics (Deep Charcoal `#121214`, Warm Amber/Gold `#F59E0B`, Rich Crimson `#DC2626`).
- **Zero-Friction Authentication**: Phone-based identity verification without passwords.
- **Local Payment Architecture**: Supports Pay at Pickup (Cash) + Yemen local hawala/mobile wallets (Al-Kuraimi, Al-Amqi, Al-Busairi) with receipt voucher upload and cashier 1-click verification.
- **Real-Time Kitchen Display System (KDS)**: 4-stage Kanban kitchen board (New, Scheduled, Baking, Ready) with sound alerts and urgency badges.
- **Manager Operations Center**: Full control over emergency order pause, per-item 86ing (stock toggles), order management, receipt verification, and revenue metrics.
- **Zero-Trust Pricing Architecture**: 100% server-side recalculation of base prices, crusts, and toppings to prevent client-side manipulation.

---

## 🧪 Try the Live Demo

The demo database is seeded automatically (idempotent, never overwrites admin edits) so every feature can be tried right away:

| What | How to try it |
|---|---|
| **Coupons** | `NOVIXA20` (20% off from 3,000 YER) · `WELCOME10` (first order, 10% from 8,000 YER) · `MUKALLA500` (500 YER off from 6,000 YER) · `HADRAMOUT` (15% from 10,000 YER) · `FAMILYBOX` (free garlic bread from 15,000 YER) |
| **Automatic gifts** | Cart of 12,000 YER+ → free cheesy garlic bread · 20,000 YER+ → free Nutella & banana fatayer (decided by the server) |
| **Loyalty reward & order history** | Use the demo phone `770000000` at checkout or in *My Orders*: 5 completed orders, reward ready to claim |
| **Reviews** | Five completed orders with customer feedback appear in the testimonials and the admin panel |
| **Staff screens** | `/kitchen` and `/admin` need the staff PINs from the server's `.env` (see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#2-day-2-operations)) |

All times (pickup slots, kitchen tickets, tracking) are shown in the restaurant's time zone, **Asia/Aden (UTC+3)**, wherever the visitor is.

---

## 📂 Project Structure

```
pizza-demo/
├── docs/                       # Complete 25-module architectural & business documentation
│   ├── PROJECT_ORIGIN.md       # Origin story, Mukalla local context, Instagram research
│   ├── PRODUCT_VISION.md       # Strategic vision & Novixa Restaurant roadmap
│   ├── RESTAURANT_DISCOVERY.md # Physical audit, equipment, menu, shift hours
│   ├── MARKET_RESEARCH.md      # Mukalla demographics, food scene, infrastructure
│   ├── COMPETITIVE_ANALYSIS.md # Mukalla competitors & differentiation
│   ├── USER_FLOWS.md           # Mermaid flowcharts for customer, cashier, & kitchen
│   ├── BUSINESS_RULES.md       # Scheduling formulas, cancellation rules, pricing
│   ├── FEATURE_SPECIFICATION.md# Complete functional matrix (P0, P1, P2)
│   ├── ROLES_PERMISSIONS.md    # RBAC model for Customer, Kitchen, Cashier, Admin
│   ├── ARCHITECTURE.md         # Next.js App Router modular monolith architecture
│   ├── DATABASE.md             # Prisma relational data model & indexing strategy
│   ├── SECURITY.md             # OWASP, anti-tamper pricing, rate limits
│   ├── SEO.md                  # JSON-LD Schema.org Restaurant metadata, OpenGraph
│   ├── DESIGN_SYSTEM.md        # Typography, color tokens, RTL guidelines
│   ├── NOTIFICATIONS.md        # WhatsApp & SMS notification strategy
│   ├── PAYMENTS.md             # Yemeni payment rails (Kuraimi, Amqi, Busairi)
│   ├── SCHEDULING.md           # Prep-time scheduling algorithm specification
│   ├── KITCHEN_WORKFLOW.md     # KDS station workflows & ticket lifecycle
│   ├── ANALYTICS.md            # Revenue, prep-accuracy, and volume metrics
│   ├── TESTING.md              # E2E, unit test, and manual QA runbook
│   ├── DEPLOYMENT.md           # Single-instance Node.js deployment runbook
│   ├── ROADMAP.md              # 4-phase rollout (Pickup MVP -> Delivery Fleet)
│   ├── AI_STRATEGY.md          # Demand forecasting & smart prep optimization
│   ├── DECISIONS.md            # Architectural Decision Records (ADRs)
│   └── OWNER_INPUT_REQUIRED.md # Formatted interview questions for restaurant owners
├── prisma/
│   ├── schema.prisma           # Relational schema (12 models)
│   └── seed.ts                 # Authentic Mukalla menu, options, and operational orders
├── src/
│   ├── app/
│   │   ├── actions/            # Server actions (Zero-trust pricing, status, receipts)
│   │   ├── admin/              # Management operations & receipt verification dashboard
│   │   ├── checkout/           # Multi-step scheduling & local payment checkout
│   │   ├── kitchen/            # Live Kitchen Display System (KDS) board
│   │   ├── menu/               # Interactive menu with category filtering & item customizer
│   │   ├── track/              # Live order tracking with progress bar & WhatsApp link
│   │   ├── globals.css         # Custom styling, dark mode tokens & glassmorphism
│   │   ├── layout.tsx          # Root layout with Cairo & Outfit fonts, RTL support
│   │   └── page.tsx            # High-conversion storefront homepage
│   ├── components/             # Reusable UI components (CartDrawer, CustomizerModal, etc.)
│   ├── context/                # AppContext (Cart state, Language RTL/LTR switch)
│   └── lib/                    # Core utilities (Prisma client, Scheduler, i18n dictionaries)
├── public/                     # Static assets & icons
├── package.json                # Dependencies & npm scripts
├── tailwind.config.ts          # TailwindCSS configuration
└── tsconfig.json               # TypeScript configuration
```

---

## 🚀 Quick Start

### 1. Requirements
- Node.js 24 LTS
- npm

### 2. Installation
```bash
git clone https://github.com/Novixa-dev/pizza-demo.git
cd pizza-demo

# Install locked dependencies
npm ci
```

### 3. Database Setup & Seeding
```bash
# Push schema to SQLite database (dev.db)
npx prisma db push

# Seed local development data (includes clearly synthetic demo orders and reviews)
npm run db:seed
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running the Production Build
```bash
npm run build
npm run start
```

### 6. Deployment (CI/CD)
Pushing to `main` runs lint, typecheck, tests and build, publishes a Docker image to GHCR, and rolls it out to the Novixa VPS behind Nginx + Cloudflare. Failed health checks roll back automatically. See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for the one-time server setup, secrets, backups and rollback procedures.

---

## 🖥️ Live Route Map

| URL Route | Role | Description |
|---|---|---|
| `/` | Customer | Premium landing page with brand hero, scheduled pre-order banner, featured items, and Mukalla branch location details. |
| `/menu` | Customer | Categorized menu with instant search, interactive pizza customizer (crust, size, extra toppings), and dynamic pricing. |
| `/checkout` | Customer | Order finalization with intelligent pickup time slot selector, zero-password phone identification, and Kuraimi/Amqi/Cash payment. |
| `/track/[id]` | Customer | Real-time visual order timeline (Received $\to$ Scheduled $\to$ In Oven $\to$ Ready) with Google Maps location and direct WhatsApp support button. |
| `/kitchen` | Kitchen Staff | Live KDS Kanban board organized into New, Scheduled Prep, In Oven, and Ready for Pickup columns with status advancement buttons and prep countdowns. |
| `/admin` | Manager / Cashier | Operational dashboard with live metrics (Revenue, Active Orders, Queue status), Emergency Pause toggle, Product stock (86ing) toggles, and Payment Receipt review drawer. |

---

## 💰 Yemeni Payment Rails Configured

The demo restaurant accepts cash at pickup alongside direct electronic transfers. The account numbers below are **demo placeholders** shown in the checkout and admin screens:

| Provider | Demo Account Number | Beneficiary Name |
|---|---|---|
| **Al-Kuraimi Bank (الكريمي)** | `PH-772207788` | بيتزا نوڤا |
| **Al-Amqi Exchange (العمقي)** | `25401982` | بيتزا نوڤا |
| **Al-Busairi Exchange (البصيري)**| `889104` | بيتزا نوڤا وسط المدينة |
| **Pay at Pickup (نقداً عند الاستلام)** | N/A | Cashier counter |

---

## 🧪 Automated Verification & Testing

Run the automated checks with `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. Browser end-to-end automation is not currently configured; use the manual journey in `docs/TESTING.md` before release. Production seeding creates only baseline restaurant/menu data and never inserts demo orders, reviews, coupons, or loyalty accounts.

---

## 📜 License & Ownership
**Pizza Demo** is a product of **[Novixa](https://novixa.dev)** and the foundational architecture of **Novixa Restaurant**. It was originally validated as a pilot with a real restaurant in Mukalla; the public demo runs under the neutral **Pizza Nova** brand.
All rights reserved © 2026 Novixa.
