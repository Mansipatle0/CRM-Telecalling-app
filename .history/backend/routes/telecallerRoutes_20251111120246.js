// backend/routes/telecallerRoutes.js
import express from "express"
import { authenticate, authorize } from "../middleware/auth.js" // optional if auth required
const router = express.Router()

// Public route that returns telecaller stats (no auth) — change to authenticate/authorize if needed
router.get("/stats", /* authenticate, authorize("telecaller"), */ async (req, res) => {
  try {
    const db = req.db
    if (!db) {
      console.error("No db on request")
      return res.status(500).json({ error: "Database not available" })
    }

    // Calls today (example assumes created_at column)
    const callsToday = await db.get(
      "SELECT COUNT(*) as total FROM calls WHERE DATE(created_at) = DATE('now')"
    )

    // Converted leads assigned to telecallers (example)
    const conversions = await db.get(
      "SELECT COUNT(*) as total FROM contacts WHERE status = 'converted'"
    )

    const totalContacts = await db.get("SELECT COUNT(*) as total FROM contacts")

    // Average duration (minutes) — adjust column name if needed
    const avgTalkTime = await db.get("SELECT ROUND(AVG(duration), 1) as avg FROM calls")

    res.json({
      callsToday: callsToday?.total || 0,
      conversions: conversions?.total || 0,
      totalContacts: totalContacts?.total || 0,
      avgTalkTime: avgTalkTime?.avg || 0,
    })
  } catch (err) {
    console.error("Telecaller stats error:", err)
    res.status(500).json({ error: err.message || "Internal server error" })
  }
})

export default router
