import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pkg from "pg"
import authRoutes from "./backend/routes/auth.js"
import userRoutes from "./backend/routes/users.js"
import contactRoutes from "./backend/routes/contacts.js"
import callRoutes from "./backend/routes/calls.js"
import analyticsRoutes from "./backend/routes/analytics.js"
import managerRoutes from "./backend/routes/managerRoutes.js"
import adminDashboardRoutes from "./backend/routes/adminDashboard.js"
import telecallerRoutes from "./backend/routes/telecallerRoutes.js"
import excelRoutes from "./backend/routes/excelRoutes.js"
import { initializePostgresSchema } from "./backend/db/schema_pg.js"

dotenv.config()

const { Pool } = pkg
const app = express()
const PORT = process.env.PORT || 5000

// ---------------------
// 🔥 Universal CORS Fix
// ---------------------
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001")
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") return res.sendStatus(200)
  next()
})

app.use(express.json())
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// ---------------------
// 🚀 Connect PostgreSQL
// ---------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

// ---------------------------
// 🚀 Start Server with PG DB
// ---------------------------
async function startServer() {
  try {
    const client = await pool.connect()
    console.log("✅ Connected to PostgreSQL")

    await initializePostgresSchema(client)
    console.log("✅ PostgreSQL schema ready")
    client.release()

    // Inject DB into every request
    app.use((req, res, next) => {
      req.db = pool
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
    app.use("/api/excel", excelRoutes)

    // Health
    app.get("/api/health", (req, res) => res.json({ status: "ok" }))

    // Error handler
    app.use((err, req, res, next) => {
      console.error("🔥 Error:", err)
      res.status(500).json({ error: err.message })
    })

    app.listen(PORT, () => console.log(`🚀 Server live @ http://localhost:${PORT}`))

  } catch (err) {
    console.error("❌ Failed:", err)
  }
}

startServer()
