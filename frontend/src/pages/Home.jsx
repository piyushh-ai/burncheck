// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import { useAudit } from "../hooks/useAudit";
import "./Home.css";

// Available tools for multi-select
const AI_TOOLS = [
  { id: "cursor", label: "Cursor" },
  { id: "github_copilot", label: "GitHub Copilot" },
  { id: "claude", label: "Claude" },
  { id: "chatgpt", label: "ChatGPT" },
  { id: "gemini", label: "Gemini" },
  { id: "windsurf", label: "Windsurf" },
];

export default function Home() {
  const navigate = useNavigate();
  const {
    form,
    status,
    error,
    draftSaved,
    updateField,
    toggleTool,
    submitAudit,
  } = useAudit();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitAudit();
      navigate("/results");
    } catch (err) {
      // Error is handled in Redux state and displayed below
      console.error("Audit submission failed:", err);
    }
  };

  return (
    <div className="container home-page">
      <section className="hero">
        <h1 className="headline">
          Find out exactly where you're burning money on AI
        </h1>
        <p className="subtext">
          Free audit for startup teams. Takes 2 minutes.
        </p>
      </section>

      <div className="card form-card">
        <div className="form-header">
          <h2>Audit Your Spend</h2>
          {draftSaved && (
            <span className="draft-badge">
              <span className="dot"></span> Draft saved
            </span>
          )}
        </div>

        {error && (
          <div className="error-banner">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="audit-form">
          {/* Honeypot — hidden from humans, bots fill it → rejected server-side */}
          <input
            type="text"
            name="_hp"
            style={{ display: "none" }}
            tabIndex="-1"
            autoComplete="off"
            aria-hidden="true"
          />
          <div className="form-grid">
            {/* Column 1 */}
            <div className="form-col">
              <div className="form-group">
                <label htmlFor="email">
                  Work Email <span className="req">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="e.g. Jane Doe"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="company">Company Name</label>
                <input
                  type="text"
                  id="company"
                  placeholder="e.g. Acme Inc"
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="form-col">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="teamSize">Team Size</label>
                  <input
                    type="number"
                    id="teamSize"
                    min="1"
                    max="500"
                    value={form.teamSize}
                    onChange={(e) => updateField("teamSize", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="useCase">Primary Use Case</label>
                  <select
                    id="useCase"
                    value={form.useCase}
                    onChange={(e) => updateField("useCase", e.target.value)}
                  >
                    <option value="coding">Coding / Engineering</option>
                    <option value="writing">Writing / Content</option>
                    <option value="research">Research</option>
                    <option value="data">Data Analytics</option>
                    <option value="mixed">Mixed / General</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <div className="slider-header">
                  <label htmlFor="monthlyBudget">Monthly AI Budget</label>
                  <span className="budget-val">${form.monthlyBudget}/mo</span>
                </div>
                <input
                  type="range"
                  id="monthlyBudget"
                  min="0"
                  max="1000"
                  step="10"
                  value={form.monthlyBudget}
                  onChange={(e) => updateField("monthlyBudget", e.target.value)}
                  className="slider"
                />
              </div>

              <div className="form-group toggle-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={form.needsAPI}
                    onChange={(e) => updateField("needsAPI", e.target.checked)}
                    className="toggle-input"
                  />
                  <span className="toggle-slider"></span>
                  <span className="toggle-text">
                    We need Developer API access
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Current AI Tools you pay for</label>
            <div className="chips-container">
              {AI_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  className={`chip ${form.currentTools.includes(tool.id) ? "active" : ""}`}
                  onClick={() => toggleTool(tool.id)}
                >
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary submit-btn"
              disabled={status === "loading"}
            >
              {status === "loading"
                ? "Analyzing 25+ Plans..."
                : "Run My Free Audit →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
