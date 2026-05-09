# User Interviews

> Conducted on 2026-05-07 and 2026-05-08 via video call and WhatsApp DM. Names anonymized at request. Each interview lasted 10–15 minutes.

---

## Interview 1

**Name:** R.M.  
**Role:** Co-founder & CTO  
**Company Stage:** Pre-seed, 8-person engineering team  

**Summary:**  
R.M. runs a developer tooling startup. His team of 8 devs uses Cursor Pro + GitHub Copilot Business + Claude Team. He had no idea what the monthly total was until I asked him to estimate — he guessed "$300ish." The actual number (which I helped him calculate) was $630/month. He was visibly surprised. He said the bills are auto-charged to the company card and nobody reviews them line-by-line. When I asked why they had both Cursor and Copilot, he said: "We started with Copilot, then Cursor became popular and a few devs wanted it. It just never got cleaned up." He mentioned that the main friction to switching isn't price — it's workflow disruption. "If I cancel Copilot, half the team will complain for two weeks." He thought a tool that showed per-tool ROI (not just cost) would be more convincing for internal buy-in.

**Direct Quotes:**  
1. "I had no idea we were paying that much. It just goes on the card."  
2. "The problem isn't finding a cheaper option — it's convincing the team that switching is worth the pain."  
3. "If you could show me what we actually use each tool for, that would be way more useful than just showing the price."  

**Most Surprising Thing:**  
He wasn't resistant to saving money — he was resistant to the *change management cost* of switching tools. The real product blocker isn't price comparison, it's making the recommendation feel safe to act on. This is why I added the "Why this fits" section on each recommendation card instead of just showing the price.

**How This Changed My Design:**  
Added the `reasons[]` list under each recommendation in the results page. The engine now outputs specific reasons why a plan fits (team size, use case, API needs) — not just the price. This makes it easier for an engineering manager to copy-paste the reasoning into a Slack message and convince their team.

---

## Interview 2

**Name:** K.S.  
**Role:** Indie hacker / solo founder  
**Company Stage:** Bootstrapped, 1-person operation  

**Summary:**  
K.S. runs two SaaS projects solo. Uses ChatGPT Plus + Claude Pro + Cursor Hobby (free). His monthly spend: $40/month ($20 + $20). He uses Claude for writing/emails, ChatGPT for brainstorming, and Cursor for coding. When I asked about overlap: "Yeah I know they overlap. I just got used to Claude for writing and ChatGPT for thinking, I can't really explain it." He's price-sensitive but his real concern was being locked in: "If I pay for annual, what if the tool gets worse?" He asked if the tool would tell him when a plan changes price — liked the idea of a notification signup. He was the reason I added the "You're spending well" message for zero-savings cases rather than manufacturing fake savings just to look useful.

**Direct Quotes:**  
1. "I know $40/month isn't much but I feel guilty that I'm not using them enough to justify both."  
2. "Half the time I use ChatGPT it's because it's my default browser tab. Not because it's better."  
3. "Tell me when something changes. I don't want to check pricing pages every month."  

**Most Surprising Thing:**  
He uses tools based on *default tab placement* in his browser, not capability. This is a massive insight: tool choice at the individual user level is often inertia, not rational comparison. For the audit tool, I can't just show "cheaper alternative" — I need to acknowledge the switching cost explicitly.

**How This Changed My Design:**  
This influenced the "honest" messaging for optimal cases: "You're spending well. Here's a notification option." I also added the "Notify me when new optimizations apply to your stack" copy to the results page email capture for zero-savings cases, rather than pushing a consultation nobody needs.

---

## Interview 3

**Name:** P.V.  
**Role:** Engineering Manager  
**Company Stage:** Series A, 22-person engineering team  

**Summary:**  
P.V. manages a 22-person team at a fintech startup. They have a formal tooling approval process — any new subscription over $100/month needs manager sign-off. Despite this, she had no unified view of AI tool costs: "Finance sees the invoices, I see the complaints." Her team uses Cursor Business + GitHub Copilot Business + OpenAI API direct. She knew the per-seat costs but not the total. When I told her the combined estimate (~$1,800/month for her team size), she said that seemed lower than she expected. Her biggest request was something she could share with her finance team — a PDF or link that shows the breakdown, not just a screenshot she screenshots herself. The shareable URL feature came directly from this conversation.

**Direct Quotes:**  
1. "I don't have one place to see what we're actually spending. Finance has the invoices, I have the Slack complaints."  
2. "The per-seat math is what kills us. We added 5 devs and nobody adjusted the plans."  
3. "Give me something I can forward to finance. A link, a PDF, anything I can share without having to re-explain it."  

**Most Surprising Thing:**  
The audience for the report isn't always the same person who runs the audit. Eng managers run the audit, but they need to share the results with finance or leadership. Building the tool for the person doing the audit was wrong — I needed to build the *shareable output* for the finance person who receives it.

**How This Changed My Design:**  
This was the primary driver for the shareable URL feature. The URL encodes the full audit result (tools, savings, recommendations) in base64 — you can paste it in Slack or email and the recipient sees the exact same results page without having to run their own audit. I also designed the results page to be "screenshot-friendly" — big numbers, clear labels, clean layout — because it will be shared as images too.

---

## Key Patterns Across All Interviews

- **Nobody tracks AI costs proactively.** Bills go on the card and get ignored. The pain is only felt when someone looks at the total and is surprised.
- **Duplicate tools are almost universal.** All three interviewees had at least one pair of overlapping tools. The reason is always the same: tool A was added, tool B became popular and got added, nobody removed A.
- **Switching cost is the real blocker, not price.** Even when people knew they were overpaying, the friction of changing workflows was the reason they hadn't switched. The audit tool needs to make the recommendation feel low-risk to act on.
- **The report consumer is often different from the report runner.** Engineering managers run the audit but share results with finance. The shareable URL (no login, clean UI) solves this.
- **People want notifications, not one-time audits.** Pricing changes. Plans change. Several interviewees wanted an alert when something in their stack changed price.
