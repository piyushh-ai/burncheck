// src/pages/Admin.jsx
import { useEffect, useState } from "react";
import { fetchLeads } from "../api/auditApi";
import "./Admin.css";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stats calculation
  const totalLeads = leads.length;
  const avgBudget = totalLeads > 0 
    ? leads.reduce((sum, l) => sum + (l.monthlyBudget || 0), 0) / totalLeads 
    : 0;
  
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      setError("");
      loadData();
    } else {
      setError("Invalid password");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container admin-auth">
        <div className="card auth-card">
          <h2>Admin Access</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="Enter admin password..." 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button type="submit" className="primary full-width">Enter Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container admin-dashboard">
      <header className="dashboard-header">
        <h1>Audit Leads Dashboard</h1>
        <button onClick={loadData} className="refresh-btn">
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </header>

      <div className="stats-row">
        <div className="card stat-card">
          <span className="stat-label">Total Leads</span>
          <span className="stat-value">{totalLeads}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">Avg Budget</span>
          <span className="stat-value">${Math.round(avgBudget)}/mo</span>
        </div>
      </div>

      <div className="card table-card">
        <div className="table-responsive">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Email</th>
                <th>Company</th>
                <th>Team</th>
                <th>Use Case</th>
                <th>Budget</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">No leads found.</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id}>
                    <td className="date-cell">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    <td className="email-cell">{lead.email}</td>
                    <td>{lead.company || "-"}</td>
                    <td>{lead.teamSize}</td>
                    <td className="capitalize">{lead.useCase}</td>
                    <td>${lead.monthlyBudget}</td>
                    <td className="summary-cell" title={lead.aiSummary}>
                      {lead.aiSummary ? "Generated ✓" : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
