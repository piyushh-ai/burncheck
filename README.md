# BurnCheck — AI Spend Audit Tool

BurnCheck is a free AI spend audit tool built for startup founders, CTOs, and engineering managers. It analyzes your team's AI tool subscriptions (Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf) and shows exactly where you're overpaying — with specific plan recommendations and dollar-amount savings.

Built as part of the Credex Web Dev Assignment 2026.

## Screenshots

> Screenshots and a short Loom walkthrough will be added once the frontend is fully wired up.
> TODO: Add 3+ screenshots of the audit form, results page, and shareable report.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Install & Run Locally

```bash
# Clone the repo
git clone https://github.com/your-username/burncheck.git
cd burncheck

# Backend
cd backend
npm install
cp .env.example .env   # Add your MONGO_URI and PORT
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables (Backend)

| Variable   | Description                  | Example                         |
|-----------|------------------------------|---------------------------------|
| `PORT`    | Server port                  | `3000`                          |
| `MONGO_URI` | MongoDB connection string  | `mongodb://localhost:27017/burncheck` |

### Deploy

```bash
# Frontend — Vercel
cd frontend
npx vercel --prod

# Backend — Render / Railway
# Push to GitHub → connect repo → set env vars → deploy
```

## Live URL

> Will be updated once deployed.  
> `https://burncheck.vercel.app` (placeholder)

## Decisions (5 Trade-offs)

### 1. Vite + React vs Next.js
**Chose Vite + React.** Next.js gives SSR and API routes in one project, which would simplify deployment. But for this assignment the backend already needed to be separate (Express + MongoDB for lead capture and audit persistence). Adding Next.js would mean two server runtimes doing overlapping work. Vite gives faster dev builds (~200ms HMR) and keeps the frontend purely a client — simpler mental model when the backend is its own service.

### 2. MongoDB + Mongoose vs Supabase (Postgres)
**Chose MongoDB.** The audit data is semi-structured — different tools have different plan shapes, nested model pricing, and optional fields like `avgMonthlyEstimate`. Mongo's schemaless nature lets the pricing data evolve without migrations. Supabase would give a nice dashboard and auth, but for a 7-day sprint where the data model is still shifting, Mongoose schemas with loose validation were faster to iterate on.

### 3. Hardcoded Rule Engine vs LLM-based Audit
**Chose hardcoded rules.** The scoring logic in `auditEngine.js` uses deterministic rules (team size thresholds, budget filters, per-seat math). An LLM could generate more nuanced recommendations, but the pricing math needs to be *exactly right* — a hallucinated number destroys credibility. Rules are testable, predictable, and debuggable. The LLM is used only for generating a natural-language summary on top of the rule-based results, where small inaccuracies are acceptable.

### 4. localStorage vs Backend for Form State
**Chose localStorage.** The audit form has multiple fields (team size, use case, budget, tools). If the user refreshes mid-form, losing all input is frustrating. Saving drafts to the backend would require auth or session management — too heavy for a free anonymous tool. localStorage persists the form state with zero backend complexity. The trade-off is that data doesn't sync across devices, but for a quick audit tool that's fine.

### 5. Monorepo (single package.json) vs Separate Frontend/Backend
**Chose separate directories.** A monorepo with workspaces (npm/pnpm) would give shared scripts and a single `npm install`. But it adds tooling complexity (workspace config, hoisting issues). Two simple directories with their own `package.json` files are easier to reason about, deploy independently, and onboard new contributors. The backend deploys to Render, the frontend to Vercel — they don't need to know about each other at build time.

## Day 2 (2026-05-08) Updates

- Completed frontend implementation using React, Redux, and the Google Stitch MCP for a premium Financial Precision design system.
- Upgraded backend uditEngine.js for advanced tool overlap detection and budget savings calculations.
- Integrated Anthropic LLM (claude-haiku) for natural language AI summaries.
- Switched to express-validator for flexible, format-only email validation.
- Wired frontend forms and backend endpoints, including local storage draft persistence and an Admin Leads dashboard.
