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
- Built Home and Results pages. Implemented LocalStorage drafting and connected frontend to backend endpoints.

**What I learned:**
- Generating UI with Stitch using strict constraints (like "NO purple/cyan") worked wonderfully to keep the app looking incredibly premium and focused.
- Calling LLM APIs in real-time inside the main request loop means users wait longer. Setting a generous axios timeout (30s) and using a fallback if the LLM crashes ensures the core rule-engine always works and users aren't left stranded.

**Blockers / what I'm stuck on:**
- Anthropic API has zero credit balance, so the fallback rule-based summary triggers. I need to either add credits to the account or just rely on the robust fallback for the final demo.

**Plan for tomorrow:**
- Add transactional email (Resend) for audit confirmation.
- Add rate limiting and honeypot spam protection.
- Implement real shareable URL (decided: base64 encode result in URL query param — no backend dependency, no PII in URL).
- Add Open Graph tags for link previews.
- Remove admin dashboard (not in assignment spec, adds attack surface).
- Run all tests and verify 14/14 pass.
- Deploy frontend to Vercel and backend to Render.

---

## Day 3 — 2026-05-09
**Hours worked:** 5

**What I did:**
- Added `emailService.js` using Resend SDK — sends HTML transactional email to user after audit. Email includes: savings hero ($X/mo + $Y/yr), top recommendation card, Credex consultation CTA for audits showing >$500/mo savings, and Claude AI summary.
- Added `express-rate-limit` to `app.js` — 10 audits/IP/15 minutes. Applied at the `/api` route level. Skipped in test environment via `NODE_ENV` check.
- Added `honeypot.js` middleware — hidden `_hp` field in form. If non-empty, silently returns fake success. Bots never know they were caught.
- Added honeypot `<input>` to `Home.jsx` — `display:none`, `tabIndex=-1`, `autoComplete=off`, `aria-hidden=true`.
- Updated `index.html` with full SEO: `<title>`, meta description, canonical URL, Open Graph (og:title, og:description, og:image, og:url), Twitter Card (summary_large_image).
- Added Credex consultation CTA on Results page — shows only when `totalMonthlySavings >= 500`. Styled with orange gradient border and prominent CTA button.
- Implemented real shareable URL — base64 encodes `{ teamSize, useCase, budget, top3Recs }` into URL query param (`/results?share=...`). Copy button copies this URL. Identifying details (email, company) are excluded from the share payload.
- Fixed critical bug: `rec.url` was `undefined` in Results.jsx — `auditEngine.js` returns `website` field. Changed `rec.url` → `rec.website` throughout Results.jsx.
- Fixed missing CSS variables: added `--error-muted`, `--primary-muted`, `--success-muted`, `--warning-muted`, `--font-3xl`, `--font-2xl`, `--font-xl`, `--font-lg` to `:root` in `index.css`.
- Added total savings hero section to Results page — big orange numbers showing monthly + annual savings. Shows "You're spending well" message for zero-savings cases (honest, per assignment spec).
- Removed admin dashboard entirely (Admin.jsx, admin routes, admin links in nav). Not in the assignment spec and adds unnecessary attack surface.
- Added "Powered by Credex →" link in TopNavBar right side.
- Updated `server.js` — removed duplicate `cors()` call that was overriding `app.js` CORS config.
- Ran full test suite: 14/14 tests pass (7 audit engine + 7 pricing validation).
- Updated all 12 documentation files to reflect Day 3 changes.

**What I learned:**
- Non-blocking email dispatch (fire-and-forget with `.catch()`) is the right pattern for transactional emails in an audit flow. The user doesn't need to wait for email delivery — they already have results on screen. Any email failures are logged server-side but never surface to the user.
- Honeypot is more user-friendly than CAPTCHA for a free tool. CAPTCHA adds friction that kills conversion. Honeypot is invisible to real users and still catches naive bots. For a tool at this stage, it's the right trade-off.
- The `btoa()` approach for shareable URLs has a gotcha: it doesn't handle Unicode characters (non-ASCII emails, company names with accents). Fixed with `btoa(unescape(encodeURIComponent(json)))` pattern.

**Blockers / what I'm stuck on:**
- Resend API key not configured yet — email silently skips (logged as info, not error). Will add key when deploying to production.
- Anthropic API credits still exhausted — fallback rule-based summary is working correctly.

**Plan for tomorrow:**
- Deploy frontend to Vercel, backend to Render.
- Update README with live URL and screenshots.
- Record Loom walkthrough (2-3 minutes).
- Final git log check — verify commits span ≥5 distinct calendar days.

---

## Day 4 — 2026-05-10
**Hours worked:** 4

**What I did:**
- Migrated the LLM integration from Anthropic Claude to Mistral AI (`@mistralai/mistralai`) for cost-efficient, high-quality audit summaries.
- Replaced Resend with Brevo SMTP, and eventually switched to Gmail SMTP (port 465) to bypass Render's strict free-tier outbound port blocking (ports 587 and 25).
- Fixed a proxy rate-limiting issue (`ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`) on Render by explicitly configuring `app.set('trust proxy', 1)` in Express so it correctly identifies client IPs behind Render's reverse proxy.
- Added frontend and backend validations to reject free email providers (e.g. gmail.com, yahoo.com) to strictly capture B2B Work Emails.
- Added a success banner on the Results page indicating that the report has been successfully emailed to the user, strictly aligning the UI with the original assignment PDF requirements.
- Cleaned up the project structure by permanently removing all redundant Admin dashboard files.
- Verified live deployment: Frontend successfully running on Vercel, Backend running on Render.

**What I learned:**
- Render's free tier entirely blocks outbound traffic on standard SMTP ports (25, 465, 587) to prevent spam. This completely broke Brevo SMTP. The most reliable workaround for free assignments is either using an HTTP REST API or falling back to Gmail SMTP over port 465 (which works seamlessly once the secure flag is dynamically set).
- When deploying an Express app behind a reverse proxy (like Render or Vercel), rate limiters will fail because they see the proxy's IP instead of the user's IP. Enabling `trust proxy` is absolutely essential.
- Mistral's Node SDK works perfectly as a drop-in replacement for Anthropic. The named import structure is slightly different (`import { Mistral }`), but the core text generation logic mapped over cleanly.

**Blockers / what I'm stuck on:**
- No major blockers. The app is fully deployed, and emails are firing correctly in production.

**Plan for tomorrow:**
- Finalize submission materials.
- Record the required Loom walkthrough demonstrating the end-to-end flow.
- Submit the GitHub repository and Loom link.
---

## Day 5 — 2026-05-11
**Hours worked:** 3
**What I did:**
- Finalized the project for the Credex submission.
- Reviewed and cleaned up all 12 markdown documents (DEVLOG, ECONOMICS, ARCHITECTURE, etc.) to ensure they accurately reflect the final state of the application (e.g. Gmail SMTP, Mistral AI, Vercel/Render deployment).
- Fixed a minor typo/accidental paste at the bottom of the ECONOMICS.md file.
- Prepared the pitch and architecture summary for the technical interview.
**What I learned:**
- Full project documentation is highly valuable, not just for the submission but for personal clarity. Summarizing the trade-offs (e.g. Mongo vs Postgres, Rule Engine vs pure LLM) makes explaining the architecture in an interview much easier.
**Blockers / what I'm stuck on:**
- None. The app is fully deployed and ready.
**Plan for tomorrow:**
- Ace the Credex technical interview!

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
