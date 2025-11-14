import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./backend/routes/auth.js";
import userRoutes from "./backend/routes/users.js";
import contactRoutes from "./backend/routes/contacts.js";
import callRoutes from "./backend/routes/calls.js";
import analyticsRoutes from "./backend/routes/analytics.js";
import managerRoutes from "./backend/routes/managerRoutes.js";
import adminDashboardRoutes from "./backend/routes/adminDashboard.js";
import telecallerRoutes from "./backend/routes/telecallerRoutes.js";

import { pool, initializeDatabase } from "./backend/db/schema.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:3000", "https://crm-telecalling-app.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// START SERVER AFTER DB INIT
async function startServer() {
  try {
    console.log("⏳ Creating tables if missing...");
    await initializeDatabase();  // ✅ NOW TABLES WILL BE CREATED
    console.log("✅ Database initialized");

    // Make pool available in all routes
    app.use((req, res, next) => {
      req.db = pool;
      next();
    });

    // ROUTES
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/contacts", contactRoutes);
    app.use("/api/calls", callRoutes);
    app.use("/api/analytics", analyticsRoutes);
    app.use("/api/manager", managerRoutes);
    app.use("/api/admin-dashboard", adminDashboardRoutes);
    app.use("/api/telecaller", telecallerRoutes);

    // Health check
    app.get("/api/health", (req, res) => res.json({ status: "ok" }));

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
}

startServer();
