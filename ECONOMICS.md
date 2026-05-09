# Unit Economics

## Value of a Converted Lead

A "converted lead" means someone who completes a BurnCheck audit, realizes they're overspending, and then purchases discounted AI credits through Credex.

**Reasoning:**
- Average Credex deal size (estimated): ~$500/month in AI credits
- Customer retention (estimated): 8 months average (AI tools are sticky)
- Customer Lifetime Value (LTV): $500 × 8 = $4,000
- Gross margin on credit resale: ~25% (Credex buys bulk, sells at discount to customer but still marks up from their wholesale cost)
- **Lead value = $4,000 × 25% = $1,000 gross profit per customer**

Even if the margin is only 15%, that's $600/customer — a single converted lead pays for months of tool infrastructure.

## Customer Acquisition Cost (CAC) Per Channel

| Channel | Estimated CAC | Reasoning |
|---------|--------------|-----------|
| Reddit (r/startups, r/SaaS) | ~$0 | Organic post, costs only my time (~2 hours) |
| Hacker News (Show HN) | ~$0 | Organic, high-quality traffic if it hits front page |
| LinkedIn cold DMs | ~$8 | ~15 min per personalized DM × 15 DMs = ~4 hours. Assuming 2 convert. |
| Dev.to article | ~$0 | Content marketing, one-time time investment |
| Credex warm email | ~$2 | Existing list, almost zero marginal cost per email |
| Product Hunt | ~$0 | One-time launch effort |

**Blended CAC estimate: ~$3-5 per lead** (weighted toward organic channels)

**LTV:CAC ratio: $1,000 / $5 = 200:1** — this is unusually high because the tool itself is free and distribution is organic. The real "cost" is building and maintaining the tool.

## Conversion Funnel

```
Visitor lands on BurnCheck
        ↓ (70% start audit — it's free, low friction)
Audit form started
        ↓ (60% complete — short form, only 4 fields)
Audit completed → sees results
        ↓ (25% enter email — to save/share report)
Email captured
        ↓ (15% have savings >$200/mo — qualified lead)
High-savings lead
        ↓ (20% book consultation)
Consultation booked
        ↓ (30% purchase credits through Credex)
Customer
```

**Monthly numbers (at 1,000 visitors/month):**

| Stage | Count | Rate |
|-------|-------|------|
| Visitors | 1,000 | — |
| Audits started | 700 | 70% |
| Audits completed | 420 | 60% of started |
| Emails captured | 105 | 25% of completed |
| High-savings leads | 63 | 15% of completed |
| Consultations booked | 13 | 20% of high-savings |
| Customers | 4 | 30% of consultations |

**Monthly revenue from 1,000 visitors = 4 × $500/mo = $2,000/month**

## Path to $1M ARR in 18 Months — What Needs to Be True

$1M ARR = $83,333/month revenue = ~167 active customers at $500/month average deal.

| Phase | Months | Visitors/mo | New Customers/mo | Cumulative Active | Monthly Revenue |
|-------|--------|-------------|------------------|-------------------|-----------------|
| Launch | 1-3 | 1,000 | 4 | 12 | $6,000 |
| Growth | 4-6 | 3,000 | 12 | 48 | $24,000 |
| Scale | 7-12 | 8,000 | 32 | 150 | $75,000 |
| Expand | 13-18 | 15,000 | 60 | 250 | $125,000 |

**Annualized at month 18: 250 × $500 × 12 = $1.5M ARR**

**What must be true for this to work:**
1. The tool must maintain >50% audit completion rate (simple UX)
2. Email capture must stay above 20% (clear value in the report)
3. Credex's sales team must close 30%+ of consultations
4. Average deal size must be $500+/month (focus on teams, not individuals)
5. Churn must stay below 12%/month (8-month average retention)
6. SEO content and word-of-mouth must drive 15,000 organic visitors by month 13 — this is the hardest assumption

**Biggest risk:** Getting from 1,000 to 15,000 monthly visitors organically. If SEO doesn't compound, we need paid acquisition, which changes the CAC math entirely.

> _All numbers above are estimates. Credex actual deal size, margin, and retention are approximations based on publicly available B2B SaaS benchmarks._
uditEngine.js for advanced tool overlap detection and budget savings calculations.
- Integrated Anthropic LLM (claude-haiku) for natural language AI summaries.
- Switched to express-validator for flexible, format-only email validation.
- Wired frontend forms and backend endpoints, including local storage draft persistence and an Admin Leads dashboard.
