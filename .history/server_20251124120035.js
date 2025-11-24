import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import sqlite3 from "sqlite3"
import { open } from "sqlite"
import authRoutes from "./backend/routes/auth.js"
import userRoutes from "./backend/routes/users.js"
import contactRoutes from "./backend/routes/contacts.js"
import callRoutes from "./backend/routes/calls.js"
import analyticsRoutes from "./backend/routes/analytics.js"
import { initializeDatabase } from "./backend/db/schema.js"
import managerRoutes from "./backend/routes/managerRoutes.js"
import adminDashboardRoutes from "./backend/routes/adminDashboard.js"
import telecallerRoutes from "./backend/routes/telecallerRoutes.js"
import excelRoutes from "./routes/excelRoutes.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
//app.use(
 // cors({
   // origin: ["http://localhost:3000","http://localhost:3001","https://crm-telecalling-app.onrender.com"],
   // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
   // allowedHeaders: ["Content-Type", "Authorization"],
   // credentials: true,
 // })
//)

//app.options("*", cors());

// 🔥 FIX: Universal CORS Middleware — (Put this at VERY TOP)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});


app.use(express.json())
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// ✅ Initialize database and start server only after DB is ready
async function startServer() {
  const db = await open({
    filename: "./backend/db/crm.db",
    driver: sqlite3.Database,
  })

  await db.exec("PRAGMA foreign_keys = ON")
  await initializeDatabase(db)
  console.log("✅ Database initialized")

  // Make db accessible in routes
  app.use((req, res, next) => {
    req.db = db
    next()
  })

  // Routes
  app.use("/api/auth", authRoutes)
  app.use("/api/users", userRoutes)
  app.use("/api/contacts", contactRoutes)
  app.use("/api/calls", callRoutes)
  app.use("/api/analytics", analyticsRoutes)
  app.use("/api/manager", managerRoutes)
  app.use("/api/admin-dashboard", adminDashboardRoutes)
  app.use("/api/telecaller", telecallerRoutes)

  // Health check
  app.get("/api/health", (req, res) => res.json({ status: "ok" }))

  // Global error handler
  app.use((err, req, res, next) => {
    console.error("Error:", err)
    res.status(err.status || 500).json({ error: err.message || "Internal server error" })
  })

  // ✅ Start server only after DB ready
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
}

startServer().catch(err => {
  console.error("❌ Failed to start server:", err)
})
