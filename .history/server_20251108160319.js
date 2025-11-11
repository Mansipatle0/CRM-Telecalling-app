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
import managerRoutes from "./routes/managerRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// Database initialization
let db
;(async () => {
  db = await open({
    filename: "./backend/db/crm.db",
    driver: sqlite3.Database,
  })

  await db.exec("PRAGMA foreign_keys = ON")
  await initializeDatabase(db)

  console.log("Database initialized")
})()

// Make db accessible to routes
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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
