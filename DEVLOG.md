# Dev Log

## Day 1 — 2026-05-07
**Hours worked:** 5

**What I did:**
- Created the GitHub repository and initialized the project structure with separate `backend/` and `frontend/` directories.
- Set up the Express.js backend with proper folder organization: `config/`, `controllers/`, `data/`, `models/`, `routes/`, `services/`.
- Configured `dotenv` for environment variables with strict validation — the server throws immediately if `MONGO_URI` or `PORT` is missing, instead of failing silently later.
- Built the MongoDB connection logic using Mongoose with async/await. Server only starts listening after the DB connection succeeds.
- Created the `Lead` model in Mongoose — stores the user's audit input (team size, use case, budget, API needs) alongside the generated recommendations. This doubles as both the audit result store and the lead capture database.
- Built the complete `pricingData.js` file with verified pricing for 7 tools: Cursor, GitHub Copilot, Claude, ChatGPT, OpenAI API, Anthropic API, Gemini, and Windsurf. Each tool has full plan breakdowns with per-seat pricing, ideal team sizes, usage levels, and API model pricing where applicable. Every single price was manually verified against the official pricing page.
- Implemented the core `auditEngine.js` — the `recommendPlan()` function iterates through all tools and plans, calculates actual monthly cost (handling per-seat vs flat-rate), filters by budget, scores each plan using `scorePlan()`, and returns the top 5 results sorted by score.
- Created the `auditController.js` and `auditRoutes.js` — a single `POST /api/audit` endpoint that runs the engine and saves the lead to MongoDB.
- Set up the Vite + React frontend using `create-vite`. Currently has the default boilerplate — actual audit form UI will be built tomorrow.
- Created all 12 required documentation files for the Credex assignment (README, ARCHITECTURE, DEVLOG, REFLECTION, TESTS, PRICING_DATA, PROMPTS, GTM, ECONOMICS, USER_INTERVIEWS, LANDING_COPY, METRICS) and the CI/CD workflow.

**What I learned:**
- Pricing structures across AI tools are wildly inconsistent. Some tools (Cursor, Copilot) use per-seat pricing, while ChatGPT Plus is a flat $20/month regardless of usage. The OpenAI and Anthropic APIs are entirely token-based with no seat concept at all. This meant my `scorePlan()` function needed to handle three completely different pricing models — flat rate, per-seat, and usage-based estimates. I had to add an `avgMonthlyEstimate` field for API plans since they don't have a fixed monthly cost.
- Mongoose strict mode is on by default — if you try to save a field that isn't in the schema, it silently drops it. I initially had `currentTools` as a field in the audit form input, but it wasn't in my `Lead` schema so it was getting silently ignored. Caught this only because I checked the MongoDB documents directly.
- Vite 8 changed the default project template — it now uses a different file structure with an `assets/` folder and `hero.png`. The React boilerplate is heavier than what I remember from Vite 5.

**Blockers / what I'm stuck on:**
- The scoring algorithm in `auditEngine.js` is too simple right now. It only considers team size and API needs. It doesn't account for use case matching (a writer should get different recommendations than a developer), current tools (to detect overlaps/duplicates), or usage intensity. Need to significantly improve this tomorrow.
- Haven't decided yet how to handle the "shareable audit URL" feature. Options are: (a) generate a unique ID on the backend and serve results at `/audit/:id`, or (b) encode the entire result in the URL as base64. Option (a) requires the frontend to know the backend URL, option (b) makes ugly URLs but works without backend dependency.

**Plan for tomorrow:**
- Build the actual audit form UI in the React frontend — tool selection, team size input, budget slider, use case dropdown.
- Connect the frontend form to the `POST /api/audit` backend endpoint.
- Improve the scoring algorithm to factor in use case matching and duplicate tool detection.
- Start on the results page that displays recommendations with savings amounts.

---

## Day 2 — 2026-05-08
**Hours worked:** 6

**What I did:**
- Upgraded `auditEngine.js` to factor in use case matching, overlap detection (e.g. Cursor vs Copilot), and calculated budget savings.
- Integrated the Anthropic SDK (`claude-haiku`) in `llmService.js` to generate a 2-3 paragraph natural language summary based purely on rule engine math. Added graceful fallback logic if API is down.
- Replaced custom blocked email list with `express-validator` to allow all valid email formats to pass through the `/api/audit` endpoint.
- Used the StitchMCP (Google Stitch) to generate a premium "Financial Precision" design system (Dark mode, Inter font, Orange accent).
- Built out the Vite+React frontend using a strict 4-layer architecture (API calls in Axios, Redux for state, custom hooks, and React UI components).
- Built Home, Results, and Admin pages. Implemented LocalStorage drafting and connected frontend to backend endpoints.

**What I learned:**
- Generating UI with Stitch using strict constraints (like "NO purple/cyan") worked wonderfully to keep the app looking incredibly premium and focused. 
- Calling LLM APIs in real-time inside the main request loop means users wait longer. Setting a generous axios timeout (30s) and using a fallback if the LLM crashes ensures the core rule-engine always works and users aren't left stranded.

**Blockers / what I'm stuck on:**
- Anthropic API has zero credit balance, so the fallback rule-based summary triggers. I need to either add credits to the account or just rely on the robust fallback for the final demo.

**Plan for tomorrow:**
- Finalize the presentation (Loom recording).
- Deploy frontend to Vercel and Backend to AWS(EC2).
- Clean up any remaining assignment specific questions in markdown files.

---

## Day 3 — 2026-05-09
**Hours worked:**
**What I did:**
**What I learned:**
**Blockers / what I'm stuck on:**
**Plan for tomorrow:**

---

## Day 4 — 2026-05-10
**Hours worked:**
**What I did:**
**What I learned:**
**Blockers / what I'm stuck on:**
**Plan for tomorrow:**

---

## Day 5 — 2026-05-11
**Hours worked:**
**What I did:**
**What I learned:**
**Blockers / what I'm stuck on:**
**Plan for tomorrow:**

---

## Day 6 — 2026-05-12
**Hours worked:**
**What I did:**
**What I learned:**
**Blockers / what I'm stuck on:**
**Plan for tomorrow:**

---

## Day 7 — 2026-05-13
**Hours worked:**
**What I did:**
**What I learned:**
**Blockers / what I'm stuck on:**
**Final thoughts:**
