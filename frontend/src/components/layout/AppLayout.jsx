// src/components/layout/AppLayout.jsx
import { Outlet } from "react-router-dom";
import TopNavBar from "./TopNavBar";
import "./AppLayout.css";

export default function AppLayout() {
  return (
    <div className="app-wrapper">
      <TopNavBar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="container">
          <p>BurnCheck analyzes 7 tools and 25+ plans to find your best fit.</p>
          <p className="copyright">© 2026 BurnCheck Audit Tool. Designed for startup teams.</p>
        </div>
      </footer>
    </div>
  );
}
