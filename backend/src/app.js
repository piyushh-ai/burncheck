import express from "express";
import cors from "cors";
import auditRoutes from "./routes/auditRoutes.js";

const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"] }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", auditRoutes);

app.get("/health", (req, res) => {
  res.json({ message: "Backend is running", status: "ok" });
});

export default app;
