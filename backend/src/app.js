// src/app.js
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import auditRoutes from "./routes/auditRoutes.js";

const app = express();

// Trust reverse proxy (required for Render so rate-limiter can read X-Forwarded-For IPs correctly)
app.set('trust proxy', 1);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://burncheck.vercel.app", // live production URL
  process.env.FRONTEND_URL, // dynamically passed from Render
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting (abuse protection) ─────────────────────────────────────────
// Limit: 10 audit requests per IP per 15 minutes
// Rationale: free tool, no auth → rate limit is the primary abuse protection
const auditLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error:
      "Too many audits from this IP. Please wait 15 minutes before trying again.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  skip: (req) => process.env.NODE_ENV === "test", // skip in test env
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", auditLimiter, auditRoutes);

// Health check — used by frontend and deployment platforms
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

export default app;
