import express from "express";
import auditRoutes from "./routes/auditRoutes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", auditRoutes);

app.get("/health", (req, res) => {
  res.json({ message: "Backend is running", status: "ok" });
});

export default app;
