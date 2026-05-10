// src/pages/Results.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAudit } from "../hooks/useAudit";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Results.css";

// Encode audit result into a real shareable base64 URL
function buildShareableURL(form, recommendations) {
  try {
    const payload = {
      t: form.teamSize,
      u: form.useCase,
      b: form.monthlyBudget,
      email: form.email,
      recs: recommendations.slice(0, 3).map((r) => ({
        tool: r.tool,
        plan: r.plan,
        cost: r.monthlyCost,
        savings: r.savingsVsBudget,
        overlapsWith: r.overlapsWith || [],
        reasons: r.reasons || ["Recommended based on your team size and use case."],
        website: r.website || "#",
      })),
      summary: "This is a shared read-only view of a BurnCheck audit.",
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    return `${window.location.origin}/results?share=${encoded}`;
  } catch {
    return window.location.href;
  }
}

export default function Results() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { form: reduxForm, recommendations: reduxRecs, summary: reduxSummary, status } = useAudit();
  
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isShared = searchParams.has("share");

  const { sharedData, error } = useMemo(() => {
    if (!isShared) return { sharedData: null, error: false };
    try {
      const encoded = searchParams.get("share");
      const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
      return {
        error: false,
        sharedData: {
          form: {
            teamSize: decoded.t,
            useCase: decoded.u,
            monthlyBudget: decoded.b,
            email: decoded.email || "Shared User",
          },
          recommendations: decoded.recs.map(r => ({
            tool: r.tool,
            plan: r.plan,
            monthlyCost: r.cost,
            savingsVsBudget: r.savings,
            overlapsWith: r.overlapsWith || [],
            reasons: r.reasons || ["Recommended based on your team size and use case."],
            website: r.website || "#",
          })),
          summary: decoded.summary || "This is a shared read-only view of a BurnCheck audit.",
        }
      };
    } catch (err) {
      console.error("Failed to parse shared URL", err);
      return { sharedData: null, error: true };
    }
  }, [isShared, searchParams]);

  useEffect(() => {
    if (!isShared && (status !== "succeeded" || reduxRecs.length === 0)) {
      navigate("/");
    }
  }, [isShared, status, reduxRecs, navigate]);

  if (error) {
    return (
      <div className="container results-page">
        <header className="results-header">
          <h1>Invalid Share Link</h1>
          <p>This audit link appears to be broken or malformed.</p>
          <button onClick={() => navigate("/")} className="primary" style={{marginTop: '20px'}}>
            Run New Audit
          </button>
        </header>
      </div>
    );
  }

  // Wait for either shared data to parse, or redux to be ready
  if (!isShared && status !== "succeeded") return null;

  const form = isShared ? sharedData.form : reduxForm;
  const recommendations = isShared ? sharedData.recommendations : reduxRecs;
  const summary = isShared ? sharedData.summary : reduxSummary;

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector(".results-page");
      const canvas = await html2canvas(element, {
        scale: 2, // higher quality
        useCORS: true,
        backgroundColor: "#0D1117", // matches dark theme background
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      
      const imgData = canvas.toDataURL("image/png");
      
      // Convert canvas dimensions to mm (1 px ≈ 0.264583 mm)
      const pxToMm = 0.264583;
      const pdfWidth = canvas.width * pxToMm;
      const pdfHeight = canvas.height * pxToMm;

      // Create a custom size PDF that exactly matches the canvas, preventing any truncation or awkward page breaks
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BurnCheck-Audit-${form?.email || "Report"}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      setIsExporting(false);
    }
  };

  // Compute total monthly savings across all recs vs budget
  const totalMonthlySavings = recommendations.reduce(
    (sum, r) => sum + Math.max(0, r.savingsVsBudget || 0),
    0
  );
  const totalAnnualSavings = totalMonthlySavings * 12;
  const showCredexCTA = totalMonthlySavings >= 500;
  const alreadyOptimal = totalMonthlySavings === 0 && recommendations.length > 0;

  const shareableURL = buildShareableURL(form, recommendations);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableURL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container results-page">
      <header className="results-header">
        <h1>Your AI Spend Audit</h1>
        <p className="meta">
          {form.email} &bull; {form.teamSize}-person {form.useCase} team &bull; ${form.monthlyBudget}/mo budget
        </p>
      </header>

      {/* Email Confirmation Banner */}
      {!isShared && (
        <div className="email-sent-banner" style={{
          background: 'rgba(63, 185, 80, 0.1)',
          border: '1px solid rgba(63, 185, 80, 0.3)',
          color: 'var(--success)',
          padding: '12px 20px',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '32px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          A copy of this detailed report has been sent to <strong>{form.email}</strong>.
        </div>
      )}

      {/* Hero — Total Savings */}
      {totalMonthlySavings > 0 && (
        <section className="savings-hero">
          <div className="card savings-hero-card">
            <div className="savings-numbers">
              <div className="savings-block">
                <span className="savings-label">Monthly Savings</span>
                <span className="savings-amount">${Math.round(totalMonthlySavings)}</span>
                <span className="savings-period">/mo</span>
              </div>
              <div className="savings-divider" />
              <div className="savings-block">
                <span className="savings-label">Annual Savings</span>
                <span className="savings-amount">${Math.round(totalAnnualSavings).toLocaleString()}</span>
                <span className="savings-period">/yr</span>
              </div>
            </div>
            <p className="savings-tagline">Potential savings by switching to recommended plans</p>
          </div>
        </section>
      )}

      {alreadyOptimal && (
        <section className="optimal-banner">
          <div className="card optimal-card">
            <span className="optimal-icon">✓</span>
            <div>
              <h3>You're spending well</h3>
              <p>Your current setup is already near-optimal for your team and use case. Sign up below to be notified when new optimizations apply to your stack.</p>
            </div>
          </div>
        </section>
      )}

      {/* Credex CTA — only shown for >$500/mo savings */}
      {showCredexCTA && (
        <section className="credex-cta-section">
          <div className="card credex-cta-card">
            <div className="credex-cta-content">
              <div className="credex-badge">Powered by Credex</div>
              <h2 className="credex-cta-title">
                You could save ${Math.round(totalMonthlySavings)}/mo — let Credex capture even more
              </h2>
              <p className="credex-cta-desc">
                Credex bulk-purchases AI API credits at negotiated rates and passes the savings directly to your team. At your spending level, companies typically save an additional 20–40% on top of plan optimization.
              </p>
              <a
                href="https://credex.rocks/"
                target="_blank"
                rel="noopener noreferrer"
                className="credex-cta-btn"
              >
                Book a Free Credex Consultation →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* AI Summary */}
      {summary && (
        <section className="summary-section">
          <div className="card summary-card">
            <div className="summary-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
              <h2>AI Analysis</h2>
            </div>
            <div className="summary-content" dangerouslySetInnerHTML={{ __html: summary.replace(/\n\n/g, '<br/><br/>') }}></div>
            <div className="summary-footer">
              <span className="ai-label">Generated by Claude AI</span>
            </div>
          </div>
        </section>
      )}

      {/* Top Recommendations */}
      <section className="recommendations-section">
        <h2 className="section-title">Top Recommendations</h2>
        <div className="rec-grid">
          {recommendations.map((rec, index) => (
            <div key={index} className="card rec-card">
              <div className="rec-header">
                <div className="rank-badge">#{index + 1}</div>
                <div>
                  <h3 className="tool-name">{rec.tool}</h3>
                  <span className="plan-name">{rec.plan}</span>
                </div>
              </div>

              <div className="price-row">
                <div className="price">${rec.monthlyCost}<span>/mo</span></div>
                {rec.savingsVsBudget > 0 ? (
                  <div className="savings-badge">
                    Saves ${Math.round(rec.savingsVsBudget)}/mo vs budget
                  </div>
                ) : rec.savingsVsBudget < 0 ? (
                  <div className="over-budget-badge">
                    ${Math.abs(Math.round(rec.savingsVsBudget))}/mo over budget
                  </div>
                ) : (
                  <div className="neutral-badge">Exact budget match</div>
                )}
              </div>

              {rec.overlapsWith && rec.overlapsWith.length > 0 && (
                <div className="overlap-warning">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>Overlaps with {rec.overlapsWith.join(", ")}</span>
                </div>
              )}

              <div className="reasons">
                <h4>Why this fits:</h4>
                <ul>
                  {rec.reasons.map((reason, rIdx) => (
                    <li key={rIdx}>{reason}</li>
                  ))}
                </ul>
              </div>

              <div className="rec-actions">
                <a href={rec.website} target="_blank" rel="noopener noreferrer" className="view-btn">
                  View Plan →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Share Section */}
      <section className="share-section" data-html2canvas-ignore="true">
        <div className="card share-card">
          <h3>Share or Export Your Results</h3>
          <p>Send this report to your CFO or engineering leadership, or download a PDF copy.</p>
          <div className="share-row">
            <input type="text" readOnly value={shareableURL} />
            <button onClick={handleCopyLink} className="primary">
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>
            <button onClick={exportToPDF} className="secondary-btn" disabled={isExporting}>
              {isExporting ? "Exporting..." : "Download PDF"}
            </button>
          </div>
        </div>
      </section>

      <div className="results-footer" data-html2canvas-ignore="true">
        <button onClick={() => navigate("/")} className="secondary-btn">
          ← Run Another Audit
        </button>
      </div>
    </div>
  );
}
