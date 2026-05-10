# Reflection

## Q1: Hardest Bug This Week

The trickiest issue I ran into was in the `auditEngine.js` scoring logic. On Day 1, after building the initial `recommendPlan()` function, I tested it with a 2-person team that had a $50/month budget. The engine was returning Cursor Business ($40/seat × 2 = $80/month) as a top recommendation — clearly over budget.

The bug was in how I calculated `monthlyCost`. My code was:
```js
let monthlyCost = plan.isPerSeat
  ? (plan.pricePerSeat || 0) * teamSize
  : plan.pricePerSeat || plan.avgMonthlyEstimate || 0;
```

The logic itself looked correct — if `isPerSeat` is true, multiply by team size. But the budget filter `if (monthlyBudget && monthlyCost > monthlyBudget) return;` was being evaluated correctly too. The problem was that `pricePerSeat` for the Cursor Business plan was `40`, team size was `2`, so `monthlyCost` should have been `80`. And `80 > 50` should have filtered it out.

After adding console.logs, I found the real issue: the `monthlyBudget` was coming in as a string `"50"` from the request body, not a number. JavaScript's `"50" && 80 > "50"` evaluates differently than `50 && 80 > 50` — string comparison was happening, where `"80" > "50"` is true (which is correct by coincidence), but `"100" > "50"` is false because string comparison goes character by character and `"1" < "5"`.

The fix was simple — `parseInt(monthlyBudget)` at the top of the function — but it took me a solid 30 minutes of staring at "correct-looking" code before I thought to check the types. Classic JavaScript.

A second bug found on Day 3: `Results.jsx` was using `rec.url` to build the "View Plan" button links, but `auditEngine.js` returns a `website` field. `rec.url` was always `undefined`, so every button linked to nothing. Fixed by changing `rec.url` → `rec.website`. This kind of prop name mismatch is exactly why TypeScript would have caught this immediately — it's in the ARCHITECTURE "Decisions" section.

## Q2: Decision I Reversed

Initially I planned to use a single LLM call (Mistral API) to do the entire audit — pass the user's input as a prompt and let Mistral figure out the best plan recommendations. The appeal was obvious: less code to write, more nuanced recommendations, and it would handle edge cases I hadn't thought of.

By mid-Day 1, I reversed this and went with a pure rule-based engine instead. Three reasons:

1. **Pricing accuracy is non-negotiable.** If the tool says "switch to Copilot Pro at $10/month" and the actual price is $19/month, the entire tool's credibility is destroyed. LLMs are trained on older data and frequently hallucinate specific numbers. I verified every price manually — I can't trust an LLM to do that.

2. **Testability.** With rules, I can write deterministic tests: "2-person team, $50 budget → should NOT recommend Cursor Business." With an LLM, the output varies between runs. How do you write a test that checks a recommendation LLM output?

3. **Cost.** Every audit would cost $0.01–0.05 in API calls. At 1000 audits/month, that's $10–50/month for a free tool. The rule engine costs $0.

I kept the LLM only for generating a natural-language summary paragraph on top of the rule-based results — where being approximate is acceptable. This hybrid approach gives users both accurate numbers AND a readable explanation.

**Second reversal on Day 3:** I originally planned to implement admin dashboard for viewing leads. Removed it on Day 3 — it's not in the assignment spec, adds unnecessary attack surface (hardcoded password in client-side code), and the real lead data lives in MongoDB Atlas where I can query it directly. Simpler is better.

## Q3: What I Would Build in Week 2

If I had another week, the most impactful feature would be **"Stack Comparison Mode."** Right now the tool audits individual plans in isolation. But most startups use 3-4 AI tools together (e.g., Cursor for coding + Claude for writing + OpenAI API for their product). The real savings come from optimizing the *combination*, not individual tools.

**What it would do:** Let users input their entire AI stack — which tools, which plans, how many seats each. The engine would then suggest an optimized stack. For example: "You're paying for both Cursor Pro ($20) and GitHub Copilot Business ($19/seat × 5 = $95). These overlap significantly for code completion. Drop Copilot and go Cursor Business ($40/seat × 5 = $200) — you lose Copilot's PR reviews but save $20/month and get Cursor's agent mode."

**Why it matters:** Every user interview I did revealed the same insight — people don't overpay on one tool, they overpay by having *duplicate* tools doing the same job. A tool-by-tool audit misses this. Stack-level analysis is where the real value is.

**Other features for week 2:**
- PDF export of the audit report (already marked as bonus in the assignment)
- Benchmark mode: "Your AI spend per developer is $X — companies your size average $Y"
- Dynamic Open Graph image per shareable URL (currently using a static OG image)
- Webhook to notify Credex Slack when a high-savings lead comes in

## Q4: AI Tools Usage

I used **Mistral (via Antigravity/IDE integration)** as my primary AI assistant throughout the project.

**What I used it for:**
- Generating the initial structure of `pricingData.js` — I described the schema I wanted and had Mistral scaffold it with placeholder values. I then went to each official pricing page and replaced every number manually.
- Writing boilerplate code — Express route/controller/model setup follows a pattern I've done dozens of times. AI saved ~20 minutes of typing but I reviewed every line.
- Drafting the documentation files — GTM strategy, economics calculations, landing copy. AI gave me a solid starting structure that I rewrote with my actual thoughts and numbers.
- Building the `emailService.js` HTML template — writing inline-CSS HTML email is tedious. Had Claude generate a starting template, then customized the design and added the Credex CTA logic.

**What I did NOT trust AI for:**
- **Pricing numbers.** Every single price in `pricingData.js` was verified by me on the official website. Mistral's training data is months old — pricing changes frequently.
- **Scoring logic.** The `scorePlan()` function needed to reflect my specific understanding of what makes a plan good for a given team. AI-generated scoring weights would be arbitrary.
- **User interview content.** The interviews in USER_INTERVIEWS.md are from actual conversations. AI can't fabricate those.
- **Security decisions.** Chose rate limiting + honeypot over CAPTCHA based on my own judgment about the UX trade-off. AI would have suggested CAPTCHA — the obvious answer.

**Specific example where AI was wrong:** When I asked Claude to help with the Anthropic API pricing, it gave me Claude 3.5 Sonnet pricing ($3 input / $15 output per 1M tokens). The actual current model is Claude Sonnet 4.6 at $3/$15 — the numbers happened to be the same, but the model name was completely wrong. If I had blindly used it, the model names in my pricing data would have been outdated. I caught this because I was already on the pricing page verifying each number.

## Q5: Self Rating

- **Discipline: 7/10** — Hit solid 5+ hours every active day, shipped all 6 MVP features within the deadline. Lost a bit of time to perfectionism on the pricing data on Day 1 when the frontend needed more attention. Day 3 was the most productive — shipped 15 meaningful changes in one session.

- **Code Quality: 8/10** — Clean separation of concerns (middleware → controller → service → data), proper error handling, non-blocking email dispatch, env var validation that fails fast. The one gap: no TypeScript, which would have caught the `rec.url` vs `rec.website` bug at compile time. Justified in ARCHITECTURE.md (7-day sprint, JS is faster to iterate).

- **Design Sense: 7/10** — Dark mode, Inter font, orange accent, custom CSS design tokens. Results page has a proper savings hero section. The Credex CTA is visually distinctive without being annoying. Would score higher with real screenshots in the README and a polished OG image.

- **Problem Solving: 8/10** — Type coercion bug (string vs number budget filter), `rec.url` vs `rec.website` mismatch, `btoa()` Unicode issue with `encodeURIComponent` workaround. Each was debugged systematically — hypothesize, add logging, verify, fix.

- **Entrepreneurial Thinking: 8/10** — GTM plan with specific channels (not "SEO and content marketing"), realistic economics with actual numbers, user interviews that changed the design (overlap detection came directly from interview feedback). The Credex CTA threshold ($500/mo) came from thinking about what user is valuable enough to warrant a sales conversation.
