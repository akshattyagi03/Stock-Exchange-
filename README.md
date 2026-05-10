# Stock‑Ex

Stock‑Ex is a full-stack **investment tracking** and **order placement** application built with **Next.js 14 (App Router)**, **TypeScript**, and **MongoDB**. It lets users sign up, authenticate via email verification, maintain watchlists, place and manage orders, and get AI-powered market insights — all in a real-time dashboard.

---

## 🧱 Features

- Email/password and Google OAuth authentication with email verification
- Dashboard with portfolio overview, P&L cards, and holdings table
- Real-time portfolio tracking with overall and daily P&L calculations
- Live market data with indices (NIFTY, SENSEX, etc.) and stock prices
- AI-powered stock analysis, stock comparison, and market insights via Google Gemini 2.5 Flash
- AI portfolio analytics (Premium tier)
- Order placement with market and limit order support
- Market hours enforcement — orders blocked outside Mon–Fri 9:15 AM–3:30 PM IST
- Background order execution worker with BullMQ + Redis
- Automatic cancellation of pending orders at market close
- Holdings management with average buy price and invested value tracking
- Trade history and order management (cancel, modify)
- User watchlist management (create, add/remove stocks, multiple lists)
- Portfolio analytics with charts and sector breakdown
- Funds management (deposits and withdrawals)
- Billing and premium subscription support
- Account settings with trading preferences and notification controls
- Trade execution email alerts via Resend
- Redis caching for optimized API performance
- Client-side form validation using Zod schemas

---

## 🛠 Tech Stack

| Purpose | Technology |
|---------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | MongoDB (via Mongoose) |
| Authentication | NextAuth.js (Credentials + Google OAuth) |
| Styling | Tailwind CSS + Shadcn UI |
| Charts | Recharts + Lightweight Charts |
| Email | Resend |
| AI | Google Gemini 2.5 Flash |
| Queue / Worker | BullMQ |
| Caching | Redis |
| External API | Upstox broker API |

---

## 🚀 Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Create a `.env.local` file at project root:

   ```env
   MONGODB_URI=your-mongodb-connection-string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=some-random-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GEMINI_API_KEY=your-gemini-api-key
   RESEND_API_KEY=your-resend-api-key
   UPSTOX_API_KEY=your-upstox-api-key
   UPSTOX_API_SECRET=your-upstox-api-secret
   UPSTOX_ACCESS_TOKEN=your-upstox-access-token
   REDIS_HOST=your-redis-host
   REDIS_PORT=your-redis-port
   REDIS_PASSWORD=your-redis-password
   ```

3. **Run in development**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run the background worker** (required for order execution)

   ```bash
   npm run worker
   ```

5. **Build and production**

   ```bash
   npm run build
   npm start
   ```

---

## 📁 Project Structure

```
/src
  /app
    /(auth)              ← sign-in, sign-up, verify pages
    /(dashboard)         ← protected dashboard routes
      /dashboard         ← portfolio overview, P&L cards, holdings table
      /holdings          ← holdings management
      /orders            ← order history
      /trade-history     ← executed trades log
      /watchlist         ← stock watchlists
      /markets           ← live market data, indices, stock search
        /[stock]         ← individual stock page with charts
      /ai-advisor        ← AI stock analysis, comparison, portfolio analytics
      /analytics         ← portfolio analytics and charts
      /funds             ← deposits and withdrawals
      /billing           ← subscription and premium plans
      /settings          ← account and trading preferences
      /quick-create      ← quick order placement
    /api
      /ai
        /analyze         ← AI stock analysis (streaming)
        /compare         ← AI stock comparison (streaming)
        /portfolio       ← AI portfolio analysis
        /market-insight  ← AI market insight summary
      /auth              ← NextAuth configuration
      /sign-up           ← user registration
      /verify-code       ← email verification
      /check-email-unique
      /create-order      ← order placement with market hours check
      /get-orders        ← fetch user orders
      /orders
        /cancel          ← cancel an order
        /modify          ← modify an order
      /holdings          ← holdings CRUD
      /markets           ← live market data
      /indices           ← market indices (NIFTY, SENSEX, etc.)
      /stocks/[symbol]   ← stock info, company details, quotes
      /search            ← instrument search
      /watchlist         ← watchlist CRUD (create, add, remove)
      /portfolio-summary ← portfolio metrics
      /portfolio-analytics
      /funds             ← deposit/withdrawal
      /trades            ← trade history
      /settings          ← user settings and preferences
      /billing           ← billing and subscription
      /upstox            ← Upstox candles and watchlist proxy
  /components            ← shared React components
    /ui                  ← Shadcn UI primitives
    /ai-advisor          ← AI advisor tab components
    /watchlist           ← watchlist table and search
  /context               ← AuthProvider
  /helpers               ← email sending helpers
  /hooks                 ← custom React hooks
  /lib                   ← DB, Redis, Gemini, Upstox, BullMQ clients
  /models                ← Mongoose schemas (User, Orders, Holdings, Watchlist)
  /schemas               ← Zod validation schemas
  /services              ← order service logic
  /types                 ← TypeScript type definitions
  /utils                 ← utility functions
  /workers
    /orderWorker.ts      ← BullMQ worker entry point (runs on Render)
    /orderEngine.ts      ← order execution, cancellation, market hours logic
/emails                  ← React Email templates
```

---

## ⚙️ Background Worker

The order execution worker runs separately from the Next.js app. It:

- Processes limit orders via BullMQ queues
- Checks market hours before executing (Mon–Fri, 9:15 AM – 3:30 PM IST)
- Cancels all pending orders at market close (3:30 PM IST cron)
- Sends trade execution email alerts

**Deployment:** The worker is deployed as a separate web service on [Render](https://render.com) using `Dockerfile.worker`. The Next.js app is deployed on Vercel.

---

## 📦 Deployment

| Service | Platform |
|---------|----------|
| Next.js app | Vercel |
| Background worker | Render (Docker, `Dockerfile.worker`) |
| Database | MongoDB Atlas |
| Cache / Queue | Redis (Redis Cloud / Upstash) |

- Set all environment variables in both Vercel and Render dashboards
- Set `NEXTAUTH_URL` to your production Vercel URL
- Configure Google OAuth credentials for the production domain
- On Render, set the Dockerfile path to `./Dockerfile.worker`

---

## 🧪 Testing

This project currently does not include automated tests. Jest and Playwright can be added later.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License. See the `LICENSE` file.
