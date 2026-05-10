# BurnCheck — AI Spend Audit Tool

BurnCheck is a free AI spend audit tool built for startup founders, CTOs, and engineering managers. It analyzes your team's AI tool subscriptions (Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf) and shows exactly where you're overpaying — with specific plan recommendations and dollar-amount savings.

Built as part of the Credex Web Dev Assignment 2026.

**Live URLs**

- **Frontend:** [https://burncheck.vercel.app](https://burncheck.vercel.app)
- **Backend API:** [https://burncheck.onrender.com](https://burncheck.onrender.com)

---

## Screenshots

> Screenshots and a Loom walkthrough will be added after deployment.
> TODO: Add 3+ screenshots of the audit form, results page, and shareable report.

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Install & Run Locally

```bash
# Clone the repo
git clone https://github.com/piyushh-ai/burncheck.git
cd burncheck

# Backend
cd backend
npm install
cp .env.example .env   # Fill in MONGO_URI, MISTRAL_API_KEY
npm run dev            # Starts at http://localhost:3000

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # Starts at http://localhost:5173
```

### Environment Variables (Backend)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | Yes | Server port | `3000` |
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb+srv://...` |
| `MISTRAL_API_KEY` | Yes | Mistral API key for AI summaries | `Your_Key` |
| `SMTP_HOST` | No | Gmail SMTP Host | `smtp.gmail.com` |
| `SMTP_PORT` | No | Gmail SMTP Port | `465` |
| `SMTP_USER` | No | Gmail Email Address | `user@gmail.com` |
| `SMTP_PASS` | No | Gmail App Password | `password` |
| `FRONTEND_URL` | No | Production frontend URL for CORS | `https://burncheck.vercel.app` |
| `NODE_ENV` | No | Environment (`development` / `production`) | `development` |

### Deploy

```bash
# Frontend → Vercel
cd frontend
npx vercel --prod

# Backend → Render
# 1. Push to GitHub
# 2. Create new Web Service on render.com
# 3. Set root dir: backend/
# 4. Build: npm install | Start: node server.js
# 5. Add environment variables (MONGO_URI, MISTRAL_API_KEY, FRONTEND_URL, PORT)
```

---

## How It Works

1. **Audit Form** — Enter your team size, use case, monthly AI budget, current tools, and whether you need API access. Form state persists across page reloads.
2. **Audit Engine** — Deterministic rule-based engine scores and ranks every plan across 7 tools. Budget filter, per-seat math, overlap detection, use-case fit.
3. **AI Summary** — Mistral AI generates a 80–100 word personalized summary. Falls back to a rule-based template if API is unavailable.
4. **Results** — Total savings hero (monthly + annual), per-tool breakdown with "View Plan" links, Credex consultation CTA for >$500/mo savings.
5. **Share** — Real shareable URL via base64-encoded result. No login, no PII in URL.
6. **Email** — Transactional confirmation email via Gmail SMTP with full audit summary.

---

## Decisions (5 Trade-offs)

### 1. Vite + React vs Next.js
**Chose Vite + React.** Next.js gives SSR and API routes in one project, which would simplify deployment. But for this assignment the backend already needed to be separate (Express + MongoDB for lead capture and audit persistence). Adding Next.js would mean two server runtimes doing overlapping work. Vite gives faster dev builds (~200ms HMR) and keeps the frontend purely a client — simpler mental model when the backend is its own service.

### 2. MongoDB + Mongoose vs Supabase (Postgres)
**Chose MongoDB.** The audit data is semi-structured — different tools have different plan shapes, nested model pricing, and optional fields like `avgMonthlyEstimate`. Mongo's schemaless nature lets the pricing data evolve without migrations. Supabase would give a nice dashboard and auth, but for a 7-day sprint where the data model is still shifting, Mongoose schemas with loose validation were faster to iterate on.

### 3. Hardcoded Rule Engine vs LLM-based Audit
**Chose hardcoded rules.** The scoring logic in `auditEngine.js` uses deterministic rules (team size thresholds, budget filters, per-seat math). An LLM could generate more nuanced recommendations, but the pricing math needs to be *exactly right* — a hallucinated number destroys credibility. Rules are testable, predictable, and debuggable. The LLM is used only for generating a natural-language summary on top of the rule-based results, where small inaccuracies are acceptable.

### 4. Rate Limit + Honeypot vs hCaptcha
**Chose rate limiting + honeypot.** CAPTCHA adds friction to the audit flow — for a free tool with no auth, making someone solve a puzzle before seeing their results kills conversion. The honeypot (hidden field bots fill, humans don't) catches naive bots silently. The rate limiter (10 requests/15min per IP) handles more sophisticated abuse. Two-layer protection with zero user friction.

### 5. Base64 Shareable URL vs Server-side Audit IDs
**Chose base64 URL encoding.** A server-side audit ID (`/audit/:id`) requires the backend to serve the result — adding a dependency and a potential failure point. Base64-encoding the result into the URL query param (`/results?share=...`) works entirely client-side, no backend required to view a shared report. Trade-off: ugly URLs and a size limit (~2KB). For this use case, that's acceptable.
