# Stock‑Ex

Stock‑Ex is a full-stack **investment tracking** and **order placement** application built with **Next.js 14 (App Router)**, **TypeScript**, and **MongoDB**.  It lets users sign up, authenticate via email verification, maintain a watchlist of stocks, and create orders through an integrated brokerage API (Upstox).

---

## 🧱 Features

- Email/password and Google OAuth authentication with email verification
- Dashboard with portfolio overview and performance metrics
- Real-time portfolio tracking with P&L calculations
- Holdings management with detailed position tracking
- User watchlist management (add/remove/view stocks)
- Order creation and retrieval powered by a custom service
- AI-powered stock analysis and comparison using Google Gemini 2.0 Flash
- Interactive charts and analytics
- Market data integration with Upstox API
- Funds management (deposits and withdrawals)
- Client‑side form validation using Zod schemas
- Robust API routes under `src/app/api`
- Context provider for auth state and helper utilities

---

## 🛠 Tech Stack

| Purpose | Technology |
|---------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | MongoDB (via Mongoose) |
| Authentication | NextAuth.js (Credentials + Google OAuth) |
| Styling | Tailwind CSS + Shadcn UI |
| Charts | Recharts |
| Email | Resend (for verification emails) |
| AI | Google Gemini 2.0 Flash |
| External API | Upstox broker API |

---

## 🚀 Getting Started

> **Note:** When adding interactive React components such as forms or buttons that rely on client-side hooks (e.g. `useState`, `useForm`, `signIn` from NextAuth), make sure the file begins with the `"use client"` directive. Without it the component will be rendered as a server component and event handlers (like `onClick`) will be stripped.
>
> For example, `src/components/login-form.tsx` needs the directive in order for the login button and Google sign-in to work properly.


1. **Install dependencies**

   ```bash
   npm install
   # or yarn
   # or pnpm install
   ```

2. **Environment variables**

   Create a `.env.local` file at project root with the following keys:

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
   ```

3. **Run in development**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build and production**

   ```bash
   npm run build
   npm start
   ```

---

## 📁 Project Structure (key folders)

```
/src
  /app               ← Next.js routes, pages, and layouts
    /(auth)          ← authentication pages (sign-in, sign-up, verify)
    /(dashboard)     ← protected dashboard routes
      /dashboard     ← main dashboard with portfolio overview
      /holdings      ← holdings management
      /orders        ← order history and management
      /watchlist     ← stock watchlist
      /markets       ← market data and charts
      /ai-advisor    ← AI-powered stock analysis
      /analytics     ← portfolio analytics
      /funds         ← funds management
    /api             ← serverless route handlers
      /ai            ← AI-powered analysis endpoints (analyze, compare)
      /auth          ← NextAuth configuration
      /sign-up       ← user registration endpoint
      /verify-code   ← email verification endpoint
      /check-email-unique ← email validation endpoint
      /holdings      ← holdings CRUD operations
      /orders        ← order management (create, get)
      /watchlist     ← watchlist operations
      /markets       ← market data endpoints
      /portfolio-summary ← portfolio metrics
      /upstox        ← Upstox API integration
  /components        ← shared React components
    /ui              ← Shadcn UI components
  /context           ← React context providers (AuthProvider)
  /helpers           ← helper functions (email sending)
  /hooks             ← custom React hooks
  /lib               ← utilities for DB, APIs, Gemini AI, Upstox
  /models            ← Mongoose schemas (User, Orders, Holdings)
  /schemas           ← Zod validation schemas
    /authSchema      ← authentication schemas
    /inputSchema     ← input validation schemas
    /orderSchema     ← order validation schemas
  /services          ← domain logic (orders, watchlists)
  /types             ← TypeScript type definitions
  /utils             ← helper functions
/emails              ← email templates (VerificationEmail)
```

---

## 🧪 Testing

This project currently does not include automated tests.  You can add Jest/Playwright later.

---

## 📦 Deployment

- Deploy on Vercel with the same environment variables.
- Ensure your MongoDB instance is reachable from Vercel.
- Configure Google OAuth credentials for production domain.
- Add production URL to NEXTAUTH_URL environment variable.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Make your changes and add tests
4. Submit a pull request

---

## 📄 License

MIT License. See the `LICENSE` file.

