// src/services/emailService.js
// Sends transactional audit confirmation emails via Resend.
// Falls back gracefully if RESEND_API_KEY is not configured.

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = "BurnCheck <noreply@burncheck.app>";

/**
 * Sends audit confirmation email to the user.
 * For high-savings cases (>$500/mo), adds Credex consultation CTA.
 */
export async function sendAuditEmail(userInput, recommendations, summary) {
  if (!resend) {
    console.log("[emailService] RESEND_API_KEY not set — skipping email");
    return;
  }

  const { email, name, teamSize, useCase, monthlyBudget } = userInput;
  const firstName = name ? name.split(" ")[0] : "there";

  // Calculate top savings
  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + Math.max(0, r.savingsVsBudget || 0),
    0
  );
  const isHighSavings = totalMonthlySavings >= 500;
  const topRec = recommendations[0];

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your BurnCheck AI Audit Results</title>
</head>
<body style="margin:0; padding:0; background:#0D1117; font-family:system-ui,-apple-system,sans-serif; color:#F0F6FC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <tr>
      <td>
        <!-- Header -->
        <div style="margin-bottom:32px;">
          <h1 style="margin:0; font-size:24px; font-weight:700; color:#E85D04;">🔥 BurnCheck</h1>
          <p style="margin:8px 0 0; font-size:14px; color:#8B949E;">AI Spend Audit Tool</p>
        </div>

        <!-- Greeting -->
        <h2 style="font-size:22px; font-weight:700; margin:0 0 8px; color:#F0F6FC;">
          Hi ${firstName}, your audit is ready
        </h2>
        <p style="font-size:15px; color:#8B949E; margin:0 0 32px; line-height:1.6;">
          Here's what we found for your ${teamSize}-person ${useCase} team with a $${monthlyBudget}/mo AI budget.
        </p>

        ${totalMonthlySavings > 0 ? `
        <!-- Savings Hero -->
        <div style="background:rgba(232,93,4,0.08); border:1px solid rgba(232,93,4,0.3); border-radius:12px; padding:28px; text-align:center; margin-bottom:32px;">
          <p style="margin:0 0 4px; font-size:13px; color:#8B949E; text-transform:uppercase; letter-spacing:0.5px;">Potential Monthly Savings</p>
          <p style="margin:0 0 4px; font-size:48px; font-weight:800; color:#E85D04; letter-spacing:-0.03em;">$${Math.round(totalMonthlySavings)}</p>
          <p style="margin:0; font-size:13px; color:#8B949E;">($${Math.round(totalMonthlySavings * 12).toLocaleString()}/year) by switching plans</p>
        </div>
        ` : `
        <!-- Optimal State -->
        <div style="background:rgba(63,185,80,0.1); border:1px solid rgba(63,185,80,0.3); border-radius:12px; padding:20px; margin-bottom:32px;">
          <p style="margin:0; font-size:15px; color:#3FB950; font-weight:600;">✓ You're already spending well</p>
          <p style="margin:8px 0 0; font-size:14px; color:#8B949E;">Your stack is near-optimal for your team size and use case. We'll notify you when new optimizations apply.</p>
        </div>
        `}

        <!-- Top Recommendation -->
        <div style="background:#161B22; border:1px solid #30363D; border-radius:12px; padding:24px; margin-bottom:32px;">
          <p style="margin:0 0 12px; font-size:12px; color:#8B949E; text-transform:uppercase; letter-spacing:0.5px;">#1 Recommendation</p>
          <h3 style="margin:0 0 4px; font-size:20px; font-weight:700; color:#F0F6FC;">${topRec.tool} — ${topRec.plan}</h3>
          <p style="margin:0 0 16px; font-size:28px; font-weight:800; color:#E85D04;">$${topRec.monthlyCost}<span style="font-size:14px; font-weight:400; color:#8B949E;">/mo</span></p>
          <p style="margin:0; font-size:14px; color:#8B949E;">${topRec.bestFor}</p>
        </div>

        ${isHighSavings ? `
        <!-- Credex CTA for high-savings cases -->
        <div style="background:linear-gradient(135deg,#1C2128,#161B22); border:1px solid #E85D04; border-radius:12px; padding:28px; margin-bottom:32px; position:relative; overflow:hidden;">
          <div style="position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#E85D04,#FF8C42);"></div>
          <p style="margin:0 0 8px; display:inline-block; background:rgba(232,93,4,0.15); border:1px solid rgba(232,93,4,0.4); color:#E85D04; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; padding:3px 10px; border-radius:20px;">Powered by Credex</p>
          <h3 style="margin:12px 0 8px; font-size:20px; font-weight:700; color:#F0F6FC;">Save even more with Credex</h3>
          <p style="margin:0 0 20px; font-size:14px; color:#8B949E; line-height:1.6;">At $${Math.round(totalMonthlySavings)}/mo in potential savings, you're a strong candidate for Credex's bulk-purchase program — where teams typically save an additional 20–40% on API costs.</p>
          <a href="https://credex.ai" style="display:inline-block; background:#E85D04; color:#fff; font-size:15px; font-weight:600; padding:14px 24px; border-radius:8px; text-decoration:none;">Book a Free Credex Consultation →</a>
        </div>
        ` : ""}

        <!-- AI Summary -->
        ${summary ? `
        <div style="background:#161B22; border:1px solid #30363D; border-radius:12px; padding:24px; margin-bottom:32px;">
          <p style="margin:0 0 12px; font-size:12px; color:#8B949E; text-transform:uppercase; letter-spacing:0.5px;">AI Analysis</p>
          <p style="margin:0; font-size:14px; color:#8B949E; line-height:1.8;">${summary}</p>
        </div>
        ` : ""}

        <!-- Footer -->
        <div style="border-top:1px solid #30363D; padding-top:24px; text-align:center;">
          <p style="margin:0 0 8px; font-size:13px; color:#484F58;">BurnCheck — Free AI Spend Audit Tool</p>
          <p style="margin:0; font-size:12px; color:#484F58;">Built by <a href="https://credex.ai" style="color:#E85D04; text-decoration:none;">Credex</a> · Unsubscribe any time</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your BurnCheck Audit: ${totalMonthlySavings > 0 ? `Save $${Math.round(totalMonthlySavings)}/mo` : "You're spending well ✓"}`,
      html: htmlBody,
    });
    console.log(`[emailService] Audit email sent to ${email}`);
  } catch (err) {
    // Don't fail the audit if email fails
    console.error("[emailService] Failed to send email:", err.message);
  }
}
