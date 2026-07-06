# 🇮🇳 India Sports Platform

A comprehensive web platform to promote Indian sports, showcase athletes, track tournaments, and support athletes through crowdfunding.

**Live Demo**: Deploy on Vercel (instructions below)

---

## ✨ Features

### Public Pages
- **Home** — Hero section, featured sports, tournaments, players, and achievements
- **Sports** — Browse all 6 sports (Cricket, Football, Badminton, Hockey, Volleyball, Wrestling/MMA)
- **Tournaments** — Live, upcoming, and completed tournaments with streaming info
- **Players** — Player profiles with bio, stats, achievements, and social links
- **Events Map** — Interactive Leaflet map showing tournaments worldwide with sport filters
- **Calendar** — FullCalendar view of all events with month/week/list views
- **Achievements** — Recent Indian sports achievements categorized by level
- **Support Athletes** — Crowdfunding page to donate to player campaigns

### Admin Panel
- Dashboard with key metrics
- Manage players, tournaments, and achievements
- (Requires Supabase connection + auth for full functionality)

### Data Pipeline
- **GitHub Actions** daily cron job for automated scraping
- **AI Parser** using Gemini API to structure unstructured data
- Prisma ORM with PostgreSQL (Supabase)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Auth | Supabase Auth |
| Maps | Leaflet + OpenStreetMap |
| Calendar | FullCalendar |
| Scraping | GitHub Actions + Node.js |
| AI Parsing | Gemini API |
| Payments | Razorpay |
| Hosting | Vercel (Free Tier) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or pnpm
- A Supabase account (free tier works)

### 1. Clone & Install

```bash
cd web
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
```
# Database (from Supabase Settings > Database)
DATABASE_URL="postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres"

# Supabase (from Supabase Settings > API)
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[service-role-key]"

# Optional: for AI scraping
GEMINI_API_KEY="[your-gemini-api-key]"

# Optional: for payments
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Optional: open Prisma Studio to browse data
npx prisma studio
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
web/
├── app/                    # Next.js App Router pages
│   ├── (public)/
│   │   ├── page.tsx        # Home
│   │   ├── sports/
│   │   ├── tournaments/
│   │   ├── players/
│   │   ├── map/
│   │   ├── calendar/
│   │   ├── achievements/
│   │   └── donate/
│   ├── (admin)/
│   │   └── admin/          # Admin panel
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Navbar, Footer
│   └── maps/               # Leaflet map components
├── lib/
│   ├── db.ts               # Prisma client
│   ├── supabase.ts         # Supabase client
│   └── data.ts             # Demo data (replace with DB)
├── prisma/
│   └── schema.prisma       # Database schema
├── scripts/                # Scraping scripts
│   ├── scrape-cricket.js
│   ├── ai-parse.js
│   └── ...
├── .github/
│   └── workflows/
│       └── scrape-daily.yml  # Daily cron job
└── public/                 # Static assets
```

---

## 🗄️ Database Schema

### Core Entities
- **Sport** — Cricket, Football, Badminton, Hockey, Volleyball, Wrestling/MMA
- **Tournament** — Events with dates, locations, streaming platforms
- **Team** — Sports teams/clubs
- **Player** — Athletes with bio, stats, medals, social links
- **Achievement** — Titles, medals, records
- **Fundraiser** — Crowdfunding campaigns for athletes
- **Profile** — User accounts (admin, player, moderator)

---

## 🤖 Data Scraping

### Manual Run
```bash
# Set env vars, then:
node scripts/scrape-cricket.js
```

### Automated (GitHub Actions)
The `.github/workflows/scrape-daily.yml` runs every day at 6:00 AM IST.

**Setup GitHub Secrets:**
1. Go to repo Settings > Secrets and variables > Actions
2. Add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `GEMINI_API_KEY`

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add Environment Variables in Vercel dashboard
4. Deploy!

### Build
```bash
cd web
npm run build
```

---

## 🗺️ Roadmap

- [ ] Connect to live Supabase database (currently using demo data)
- [ ] Implement Supabase Auth (login/signup)
- [ ] Player registration & fundraiser creation flow
- [ ] Razorpay payment integration
- [ ] Complete scraping scripts for all 6 sports
- [ ] Real-time updates via Supabase Realtime
- [ ] Tournament detail pages with match listings
- [ ] Search functionality
- [ ] Admin CRUD operations (full edit/create)
- [ ] Mobile app (Expo / React Native)
- [ ] Multi-language support (Hindi, Tamil, etc.)

---

## 🤝 Contributing

This is an open-source project to support Indian sports. Contributions welcome!

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Open a pull request

---

## 📄 License

MIT License — free to use, modify, and distribute.

Built with pride for 🇮🇳 Indian athletes.
