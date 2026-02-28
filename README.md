<p align="center">
  <img src="public/app-icon-1024.svg" width="80" height="80" alt="Tend" />
</p>

<h1 align="center">tend.</h1>

<p align="center">
  <strong>Quit bad habits. Grow new ones.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#roadmap">Roadmap</a> ·
  <a href="#philosophy">Philosophy</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.1.0-4ade80?style=flat-square&labelColor=0a0e18" />
  <img src="https://img.shields.io/badge/next.js-16-white?style=flat-square&labelColor=0a0e18" />
  <img src="https://img.shields.io/badge/react-19-61dafb?style=flat-square&labelColor=0a0e18" />
  <img src="https://img.shields.io/badge/license-proprietary-8b85a0?style=flat-square&labelColor=0a0e18" />
  <img src="https://img.shields.io/badge/data-encrypted%20cloud-22c55e?style=flat-square&labelColor=0a0e18" />
</p>

<br />

<p align="center">
  <em>[ screenshot placeholder — add UI screenshot here ]</em>
</p>

<br />

---

## The Problem

Most habit trackers assume you already have momentum. They hand you a checkbox and a streak counter. But if you're on hour 6 of quitting nicotine, white-knuckling through cravings at 2 AM — you need more than a checkbox.

**Tend is a habit tracker built for people fighting real battles.** It combines recovery support (guided breathing, urge journaling, physical redirects) with a gamified world that grows with your progress. Every quit habit plants an egg that cracks, wobbles, and hatches over 72 hours. Every urge you survive earns coins and brings your creature closer to life.

It's [Forest](https://www.forestapp.cc/) meets [Tamagotchi](https://en.wikipedia.org/wiki/Tamagotchi) meets the hardest thing you've ever done.

---

## Features

### Dual-Mode Habit Tracking
- **Quit habits** — sobriety-style counters that tick automatically. You're clean unless you say otherwise. No daily checkboxes for things you're *not* doing.
- **Build habits** — traditional daily check-offs for exercise, meditation, hydration, journaling, and anything you want to grow.

### Urge Intervention System
When cravings hit, tap **Urge** and choose your weapon:
- **Breathe** — 5-cycle guided breathing (4s inhale → 4s hold → 6s exhale) with animated visual ring
- **Write it out** — quick journal with trigger tags (Stress, Boredom, Social, Night) to identify patterns over time
- **Redirect** — randomized 2-minute physical activities (cold water, pushups, grounding exercises) to break the craving cycle

Every urge survived earns coins and accelerates egg hatching.

### Living Planet
Your habits grow creatures on a tiny planet inspired by *The Little Prince*. The planet starts with natural foliage — grass, flowers, a small tree — and fills with life as you progress. Creatures evolve through 5 stages (Egg → Hatchling → Young → Growing → Evolved) based on consistency.

### Egg Progression
New quit habits begin as eggs that visually transform over 72 hours:
- **0–12h**: Clean egg, gentle pulse
- **12–24h**: Hairline crack, wobble begins
- **24–48h**: Multiple cracks, pronounced wobble
- **48–72h**: Heavy cracks, intense shaking, sparkle particles
- **72h+**: Hatch animation with flash, burst, and creature reveal

### AA-Style Milestone Coins
Recovery medallions awarded at 2h, 6h, 12h, 24h, 48h, 72h, 1 week, 2 weeks, 1 month, 2 months, 3 months, 6 months, and 1 year. Color progression from stone gray → bronze → green → blue → purple → red → gold. Each coin is earned, never given.

### Healing Timelines
Science-backed body recovery timelines for quit habits. See what's happening inside your body at each milestone — from heart rate normalizing at 2 hours to lung function improving at 90 days.

### Insights & Analytics
- **Multi-habit heatmap** — vertical color columns showing all habits at a glance
- **Trigger patterns** — aggregated urge journal data revealing when and why cravings hit
- **Habit synergies** — constellation visualization showing which habits reinforce each other
- **Money saved** — real-time calculator based on daily cost of the habit you quit

### Engagement Without Manipulation
- **Morning check-in** — daily pledge ("I'm still clean") with a science fact about your body healing
- **Creature reactions** — creatures respond to your habits (thriving, neglected, sleeping) via CSS state changes
- **Night wind-down** — calm end-of-day screen when all habits are complete
- **Compassionate relapse** — no shame, no red screens. "You went 3 days. That strength is still inside you."
- **Weekly recap** — Sunday summary with habit completion rates, urges beaten, and coins earned

### Monetization
- **Free tier**: 3 habits, all recovery features, basic shop, simplified insights
- **Tend+** ($4.99/mo or $29.99/yr): Unlimited habits, +5 daily coins, full insights, premium decorations, custom colors

Recovery features are **never** gated. Breathing, urge support, healing timelines, and relapse compassion are free forever.

---

## Architecture

<p align="center">
  <a href="docs/architecture.html">
    <img src="public/tend-architecture.svg" alt="System Architecture" width="100%" />
  </a>
  <br />
  <em>Full interactive diagram: <code>docs/architecture.html</code></em>
</p>

### Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Server components, SSR data loading, API routes |
| **UI** | React 19 + Tailwind CSS | Component architecture, utility styling |
| **Auth** | Clerk | Authentication, user management, webhooks |
| **Database** | Supabase (PostgreSQL) | Cloud persistence, RLS, real-time |
| **Rendering** | Pixel art sprites (Sprout Lands) | Creature and decoration assets |
| **Icons** | Lucide React | Consistent, clean iconography |
| **Typography** | Fraunces + DM Sans | Serif display + clean body |
| **Payments** | Stripe (web) / StoreKit (iOS) | Subscription billing, webhook-verified |
| **Hosting** | Vercel | Edge deployment, instant previews |
| **Native** | React Native + Expo | iOS App Store distribution |

### Data Model

All user data is stored in Supabase (PostgreSQL) and tied to authenticated Clerk accounts. A localStorage cache provides instant hydration while the server remains the source of truth. No telemetry. No tracking.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Development

```bash
# Clone the repository
git clone https://github.com/JonathanDunkleberger/Tend.git
cd tend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — best viewed at 375px width (mobile).

### Build

```bash
npm run build
npm start
```

### Deploy

```bash
# Vercel (recommended)
vercel --prod
```

---

## Roadmap

### v1.0 — Launch *(shipped)*
- [x] Dual-mode habit tracking (build + quit)
- [x] Urge intervention system (Breathe / Write / Redirect)
- [x] Living planet with pixel art creatures
- [x] Egg progression with 72-hour hatch cycle
- [x] AA-style milestone coins
- [x] Healing timelines
- [x] Coin economy + World Shop
- [x] Tend+ subscription
- [x] Morning check-in + creature reactions
- [x] Privacy policy + Terms of Service

### v1.1 — Cloud & Polish *(current)*
- [x] Clerk authentication + Supabase cloud sync
- [x] Stripe webhook-verified subscriptions
- [x] Server-side rendering with SSR data loading
- [x] Animation tier system (reduced motion support)
- [x] Typed API layer with error handling
- [ ] React Native build for App Store
- [ ] TestFlight beta

### v1.2 — Engagement
- [ ] Push notifications (native, opt-in, max 2/day)
- [ ] Sound design (optional, ASMR-quality)
- [ ] Weekly recap (Sunday summary)
- [ ] Night wind-down screen
- [ ] Persisted urge journal insights

### v1.3 — Social
- [ ] Shared planets (anonymous accountability partner)
- [ ] Shareable milestone cards (privacy-safe, no habit names by default)

### v2.0 — Growth
- [ ] Seasonal events (cosmetic, Tend+ only)
- [ ] Expanded creature catalog
- [ ] Custom creature naming
- [ ] Cloud sync (optional, encrypted)

---

## Philosophy

### Recovery features are free. Forever.

Breathing timer, urge journal, healing timelines, relapse support, and milestone coins will never be moved behind a paywall. If someone is having a craving at 2 AM, the last thing they should see is a purchase screen.

### No shame mechanics.

There are no red screens, broken streaks, or dying creatures. Relapsing shows: "You went 3 days. That strength is still inside you." Users earn +5 coins for honesty when they reset. The app should be the last thing someone deletes, not the first.

### Your data is yours.

Tend stores data in an encrypted cloud database tied to your authenticated account — no anonymous analytics, no tracking pixels, no data brokers. We can't sell what we don't collect. Your recovery journey syncs across devices but stays private.

### Engagement without addiction.

We're building an app for people breaking addictions. The engagement model must be fundamentally different from apps that exploit attention. No loot boxes, no daily login obligations, no guilt notifications, no "your creature is dying" manipulation. Every feature should make users feel cared for, not surveilled.

---

## Credits

- **Creature & decoration art**: [Sprout Lands](https://cupnooble.itch.io/sprout-lands-asset-pack) by Cup Nooble
- **Icons**: [Lucide](https://lucide.dev/)
- **Typography**: [Fraunces](https://fonts.google.com/specimen/Fraunces) by Undercase Type · [DM Sans](https://fonts.google.com/specimen/DM+Sans) by Colophon Foundry

---

<p align="center">
  <strong>tend.</strong> — Quit bad habits. Grow new ones.
</p>
