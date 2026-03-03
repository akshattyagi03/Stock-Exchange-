# Stock‑Ex

Stock‑Ex is a full-stack **investment tracking** and **order placement** application built with **Next.js 14 (App Router)**, **TypeScript**, and **MongoDB**.  It lets users sign up, authenticate via email verification, maintain a watchlist of stocks, and create orders through an integrated brokerage API (Upstox).

---

## 🧱 Features

- Email/password authentication with verification codes
- User watchlist management (add/remove/view stocks)
- Order creation and retrieval powered by a custom service
- Integration with Upstox for real‑time candle data and order execution
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
| Authentication | NextAuth.js (email provider) |
| Styling | Tailwind CSS + custom CSS modules |
| Email | Resend (for verification emails) |
| Caching | Redis |
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
   UPSTOX_API_KEY=...
   UPSTOX_API_SECRET=...
   REDIS_URL=redis://localhost:6379
   RESEND_API_KEY=...
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
    /api             ← serverless route handlers
    /login           ← client‑side login page
    /signup          ← registration page
    /components      ← shared React components
    /context         ← React context providers
    /lib             ← utilities for DB, APIs, etc.
    /models          ← Mongoose schemas
    /services        ← domain logic (orders, watchlists)
    /schemas         ← Zod validation schemas
    /utils           ← helper functions
```

---

## 🧪 Testing

This project currently does not include automated tests.  You can add Jest/Playwright later.

---

## 📦 Deployment

- Deploy on Vercel with the same environment variables.
- Ensure your MongoDB and Redis instances are reachable from Vercel.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Make your changes and add tests
4. Submit a pull request

---

## 📄 License

MIT License. See the `LICENSE` file.

