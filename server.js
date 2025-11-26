import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

// ---------------------------
// Resolve __dirname for ES modules
// ---------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------
// Load .env automatically (LOCAL & RENDER both)
// ---------------------------
dotenv.config(); // <-- FIXED: No Windows path

console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

// ---------------------------
// Express app setup
// ---------------------------
const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------
// CORS
// ---------------------------
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// ---------------------------
// PostgreSQL
// ---------------------------
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

// ---------------------------
// DB Schema
// ---------------------------
import { initializePostgresSchema } from "./backend/db/schema_pg.js";

// ---------------------------
// Routes
// ---------------------------
import authRoutes from "./backend/routes/auth.js";
import userRoutes from "./backend/routes/users.js";
import contactRoutes from "./backend/routes/contacts.js";
import callRoutes from "./backend/routes/calls.js";
import analyticsRoutes from "./backend/routes/analytics.js";
import managerRoutes from "./backend/routes/managerRoutes.js";
import adminDashboardRoutes from "./backend/routes/adminDashboard.js";
import telecallerRoutes from "./backend/routes/telecallerRoutes.js";
import excelRoutes from "./backend/routes/excelRoutes.js";

// ---------------------------
// Start server
// ---------------------------
async function startServer() {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL");

    await initializePostgresSchema(client);
    console.log("🔥 Schema ready");

    client.release();

    // Inject pool in req
    app.use((req, res, next) => {
      req.db = pool;
      next();
    });

    // API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/contacts", contactRoutes);
    app.use("/api/calls", callRoutes);
    app.use("/api/analytics", analyticsRoutes);
    app.use("/api/manager", managerRoutes);
    app.use("/api/admin-dashboard", adminDashboardRoutes);
    app.use("/api/telecaller", telecallerRoutes);
    //app.use("/api/excel", excelRoutes);
    app.use("/dashboard/admin", excelRoutes);

    // Health endpoint
    app.get("/api/health", (req, res) => res.json({ status: "ok" }));

    // Global error handler
    app.use((err, req, res, next) => {
      console.error("🔥 Error:", err);
      res.status(500).json({ error: err.message });
    });

    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );

  } catch (err) {
    console.error("❌ PG Connection failed:", err);
  }
}

startServer();
