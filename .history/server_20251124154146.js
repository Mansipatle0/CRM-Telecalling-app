import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pkg from "pg";

import authRoutes from "./backend/routes/auth.js";
import userRoutes from "./backend/routes/users.js";
import contactRoutes from "./backend/routes/contacts.js";
import callRoutes from "./backend/routes/calls.js";
import analyticsRoutes from "./backend/routes/analytics.js";
import managerRoutes from "./backend/routes/managerRoutes.js";
import adminDashboardRoutes from "./backend/routes/adminDashboard.js";
import telecallerRoutes from "./backend/routes/telecallerRoutes.js";
import excelRoutes from "./backend/routes/excelRoutes.js";
import { initializePostgresSchema } from "./backend/db/schema_pg.js";

// ---------------------------
// Windows-safe __dirname
// ---------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------
// Load .env from project root
// ---------------------------
const envPath = path.join(__dirname, "..", ".env");
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

// Debug check
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// ---------------------------
// Postgres Pool
// ---------------------------
const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------
// CORS
// ---------------------------
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------
// PostgreSQL Pool (SSL)
const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    isProduction || process.env.FORCE_SSL
      ? { rejectUnauthorized: false }
      : false,
});

// ---------------------------
// Start Server
// ---------------------------
async function startServer() {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL");

    await initializePostgresSchema(client);
    console.log("🔥 PostgreSQL schema initialized");
    client.release();

    // Inject DB into requests
    app.use((req, res, next) => {
      req.db = pool;
      next();
    });

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/contacts", contactRoutes);
    app.use("/api/calls", callRoutes);
    app.use("/api/analytics", analyticsRoutes);
    app.use("/api/manager", managerRoutes);
    app.use("/api/admin-dashboard", adminDashboardRoutes);
    app.use("/api/telecaller", telecallerRoutes);
    app.use("/api/excel", excelRoutes);

    // Health check
    app.get("/api/health", (req, res) => res.json({ status: "ok" }));

    // Error handler
    app.use((err, req, res, next) => {
      console.error("🔥 Error:", err);
      res.status(500).json({ error: err.message });
    });

    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ PG Connection Failed:", err);
  }
}

startServer();
