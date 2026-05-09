# Metrics

## North Star Metric

**"High-savings audits completed per week"**

A "high-savings" audit is one where the engine identifies >$200/month in potential savings. This is the metric because:

- **It directly correlates with business value.** High-savings users are qualified leads for Credex — they have the budget and the pain to justify purchasing discounted credits.
- **Daily Active Users is the wrong metric** for a tool like this. People audit their AI spend quarterly, not daily. Optimizing for DAU would push us toward engagement tricks (emails, dashboards) instead of core value.
- **Total audits completed is a vanity metric.** Someone with $5/month in potential savings isn't a meaningful user for Credex. Filtering for >$200/month ensures we measure the users who actually matter.

## 3 Input Metrics That Drive the North Star

### 1. Audit Completion Rate
**Definition:** Percentage of users who start the audit form and submit it.
**Target:** >60%
**Why it matters:** If people start the form but don't finish, the form is either too long, confusing, or asks for information they don't have. Currently the form has 4 fields (team size, use case, budget, API needs). If completion drops below 40%, we need to remove fields or add progressive disclosure.
**How to measure:** `(POST /api/audit requests) / (form page views)`

### 2. Email Capture Rate
**Definition:** Percentage of users who complete an audit AND enter their email to save the report.
**Target:** >25%
**Why it matters:** Email is the handoff point to Credex's sales team. If users see results but don't enter their email, either (a) the results aren't valuable enough, or (b) the email ask is too aggressive. This metric directly measures whether the audit output is perceived as worth saving.
**How to measure:** `(emails collected) / (audits completed)`

### 3. Share Rate (Shareable URL Clicks)
**Definition:** Percentage of completed audit URLs that receive at least one external visit.
**Target:** >5%
**Why it matters:** This is the viral loop. If someone shares their audit result with their CTO or finance lead, that's a free qualified visitor who already has context. A healthy share rate compounds organic growth without any paid acquisition.
**How to measure:** `(unique audit URLs with >1 visitor) / (total audit URLs generated)`

## What to Instrument First

In order of priority:

1. **Audit completion funnel** — Track each step: form loaded → fields filled → submitted → results displayed. Identify the drop-off point. Use simple server-side logging (no analytics SDK needed initially).

2. **Tool selection frequency** — Which AI tools are most commonly selected by users? This tells us which tools to prioritize in pricing accuracy and which comparison angles to use in marketing. Log the `useCase` and `needsAPI` values from each audit request.

3. **Savings distribution** — Histogram of savings amounts across all audits. What percentage show >$200/month savings? If it's <10%, either our pricing data is wrong, users are already optimized, or our scoring algorithm is too conservative.

## Pivot Triggers

**If after 2 weeks of launch:**

| Signal | Threshold | Action |
|--------|-----------|--------|
| Email capture rate | <10% | The audit results aren't perceived as valuable enough. Add more detail to the results page — breakdown per tool, comparison chart, estimated annual savings. |
| 0 consultation bookings from 50+ high-savings audits | 0 bookings | The Credex CTA is either not visible, not compelling, or placed in the wrong spot. A/B test CTA placement: inline in results vs separate "Talk to an advisor" page. |
| Audit completion rate | <30% | The form is too complex or asks questions users can't answer. Remove the budget field (least important for recommendations) and calculate it from their selections instead. |
| >80% of audits show <$50 savings | Consistently | Our target users are already optimized, or we're attracting the wrong users. Shift distribution channels to target larger teams (10+ people) where the waste is bigger. |

