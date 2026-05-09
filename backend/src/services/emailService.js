// src/services/emailService.js
// Sends transactional audit confirmation emails via Brevo SMTP using Nodemailer.
// Falls back gracefully if SMTP credentials are not configured.

import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Sends audit confirmation email to the user via Nodemailer + Brevo SMTP.
 * - For savings > $500/mo: includes prominent Credex consultation CTA.
 * - For zero savings: sends honest "you're spending well" message.
 * - Never throws — logs errors but never fails the audit response.
 */
export async function sendAuditEmail(userInput, recommendations, summary) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("[emailService] SMTP credentials not fully set — skipping email");
    return;
  }

  const { email, name, teamSize, useCase, monthlyBudget } = userInput;
  const firstName = name ? name.split(" ")[0] : "there";

  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + Math.max(0, r.savingsVsBudget || 0),
    0
  );
  const isHighSavings = totalMonthlySavings >= 500;
  const topRec = recommendations[0];

  const subject = totalMonthlySavings > 0
    ? `Your BurnCheck Audit: Save $${Math.round(totalMonthlySavings)}/mo`
    : `Your BurnCheck Audit: You're spending well ✓`;

  const htmlContent = buildEmailHtml({
    firstName,
    teamSize,
    useCase,
    monthlyBudget,
    totalMonthlySavings,
    isHighSavings,
    topRec,
    summary,
  });

  const mailOptions = {
    from: '"BurnCheck" <noreply@burncheck.app>', // Sender address
    to: email, // List of receivers
    subject: subject, // Subject line
    html: htmlContent, // HTML body
    replyTo: "hello@burncheck.app",
  };

  try {
    const info = await mailer.sendMail(mailOptions);
    console.log(`[emailService] Audit email sent via SMTP to ${email} (Message ID: ${info.messageId})`);
  } catch (err) {
    // Never fail the audit response — email is best-effort
    console.error("[emailService] SMTP send failed:", err.message);
  }
}

function buildEmailHtml({
  firstName,
  teamSize,
  useCase,
  monthlyBudget,
  totalMonthlySavings,
  isHighSavings,
  topRec,
  summary,
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your BurnCheck AI Audit</title>
</head>
<body style="margin:0;padding:0;background:#0D1117;font-family:system-ui,-apple-system,sans-serif;color:#F0F6FC;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="padding-bottom:28px;">
          <p style="margin:0;font-size:26px;font-weight:800;color:#E85D04;letter-spacing:-0.5px;">🔥 BurnCheck</p>
          <p style="margin:4px 0 0;font-size:13px;color:#8B949E;">AI Spend Audit Tool — Powered by Credex</p>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding-bottom:28px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F0F6FC;">Hi ${firstName}, your audit is ready</h1>
          <p style="margin:0;font-size:15px;color:#8B949E;line-height:1.6;">
            Here's what we found for your ${teamSize}-person ${useCase} team with a $${monthlyBudget}/mo AI budget.
          </p>
        </td></tr>

        ${totalMonthlySavings > 0 ? `
        <!-- Savings Hero -->
        <tr><td style="padding-bottom:28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(232,93,4,0.08);border:1px solid rgba(232,93,4,0.3);border-radius:12px;">
            <tr><td style="padding:28px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#8B949E;text-transform:uppercase;letter-spacing:1px;">POTENTIAL MONTHLY SAVINGS</p>
              <p style="margin:0 0 4px;font-size:52px;font-weight:800;color:#E85D04;letter-spacing:-0.03em;">$${Math.round(totalMonthlySavings)}</p>
              <p style="margin:0;font-size:14px;color:#8B949E;">$${Math.round(totalMonthlySavings * 12).toLocaleString()}/year — by switching to recommended plans</p>
            </td></tr>
          </table>
        </td></tr>
        ` : `
        <!-- Optimal -->
        <tr><td style="padding-bottom:28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(63,185,80,0.08);border:1px solid rgba(63,185,80,0.3);border-radius:12px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#3FB950;">✓ You're already spending well</p>
              <p style="margin:0;font-size:14px;color:#8B949E;">Your stack is near-optimal for your team size and use case.</p>
            </td></tr>
          </table>
        </td></tr>
        `}

        <!-- Top Recommendation -->
        ${topRec ? `
        <tr><td style="padding-bottom:28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#161B22;border:1px solid #30363D;border-radius:12px;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#8B949E;text-transform:uppercase;letter-spacing:1px;">#1 RECOMMENDATION</p>
              <p style="margin:0 0 4px;font-size:20px;font-weight:700;color:#F0F6FC;">${topRec.tool} — ${topRec.plan}</p>
              <p style="margin:0 0 12px;font-size:32px;font-weight:800;color:#E85D04;">$${topRec.monthlyCost}<span style="font-size:15px;font-weight:400;color:#8B949E;">/mo</span></p>
              <p style="margin:0;font-size:13px;color:#8B949E;">${topRec.bestFor || ""}</p>
            </td></tr>
          </table>
        </td></tr>
        ` : ""}

        ${isHighSavings ? `
        <!-- Credex CTA (only for >$500/mo savings) -->
        <tr><td style="padding-bottom:28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1C2128;border:1px solid #E85D04;border-radius:12px;position:relative;">
            <tr><td style="padding:0;height:3px;background:linear-gradient(90deg,#E85D04,#FF8C42);border-radius:12px 12px 0 0;"></td></tr>
            <tr><td style="padding:24px;">
              <p style="margin:0 0 10px;display:inline-block;background:rgba(232,93,4,0.15);border:1px solid rgba(232,93,4,0.4);color:#E85D04;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:3px 10px;border-radius:20px;">Powered by Credex</p>
              <p style="margin:10px 0 8px;font-size:19px;font-weight:700;color:#F0F6FC;">You could save even more with Credex</p>
              <p style="margin:0 0 20px;font-size:14px;color:#8B949E;line-height:1.6;">
                At $${Math.round(totalMonthlySavings)}/mo in potential savings, you qualify for Credex's bulk-purchase program — teams typically save an additional 20–40% on API costs on top of plan optimization.
              </p>
              <a href="https://credex.ai" style="display:inline-block;background:#E85D04;color:#ffffff;font-size:15px;font-weight:600;padding:13px 24px;border-radius:8px;text-decoration:none;">
                Book a Free Credex Consultation →
              </a>
            </td></tr>
          </table>
        </td></tr>
        ` : ""}

        ${summary ? `
        <!-- AI Summary -->
        <tr><td style="padding-bottom:28px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#161B22;border:1px solid #30363D;border-radius:12px;">
            <tr><td style="padding:24px;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#8B949E;text-transform:uppercase;letter-spacing:1px;">AI Analysis</p>
              <p style="margin:0;font-size:14px;color:#8B949E;line-height:1.8;">${summary}</p>
            </td></tr>
          </table>
        </td></tr>
        ` : ""}

        <!-- Footer -->
        <tr><td style="border-top:1px solid #30363D;padding-top:24px;text-align:center;">
          <p style="margin:0 0 6px;font-size:13px;color:#484F58;">BurnCheck — Free AI Spend Audit Tool</p>
          <p style="margin:0;font-size:12px;color:#484F58;">
            Built by <a href="https://credex.ai" style="color:#E85D04;text-decoration:none;">Credex</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}
