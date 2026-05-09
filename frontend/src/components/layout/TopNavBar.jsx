// src/components/layout/TopNavBar.jsx
import { Link } from "react-router-dom";
import "./TopNavBar.css";

export default function TopNavBar() {
  return (
    <header className="top-nav">
      <div className="container nav-container">
        <Link to="/" className="logo-area">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C12 2 5 9.5 5 14.5C5 18.0899 7.91015 21 11.5 21C15.0899 21 18 18.0899 18 14.5C18 10 12 2 12 2Z" fill="var(--primary)"/>
            </svg>
          </div>
          <span className="brand-name">BurnCheck</span>
        </Link>

        <div className="nav-right">
          <span className="tagline">Stop overpaying for AI tools</span>
          <a
            href="https://credex.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-credex-link"
          >
            Powered by Credex →
          </a>
        </div>
      </div>
    </header>
  );
}
