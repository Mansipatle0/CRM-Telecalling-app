import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import authRoutes from "./backend/routes/auth.js"
import userRoutes from "./backend/routes/users.js"
import contactRoutes from "./backend/routes/contacts.js"
import callRoutes from "./backend/routes/calls.js"
import analyticsRoutes from "./backend/routes/analytics.js"
import managerRoutes from "./backend/routes/managerRoutes.js"

import { initializeDatabase } from "./backend/db/schema.js"  // PostgreSQL schema
import { pool } from "./backend/db/schema.js"                // PostgreSQL pool

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// INIT PostgreSQL DB
;(async () => {
  try {
    await initializeDatabase()     // ← IMPORTANT: Creates tables if not present
    console.log("PostgreSQL Database initialized")
  } catch (error) {
    console.error("DB ERROR:", error)
  }
})()

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/contacts", contactRoutes)
app.use("/api/calls", callRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/manager", managerRoutes)

// Health check
app.get("/", (req, res) => {
  res.send("CRM Backend Running with PostgreSQL")
})

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

// Error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err)
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  })
})

app.listen(PORT, () => {
  console.log(`Server running on Render at port ${PORT}`)
})
