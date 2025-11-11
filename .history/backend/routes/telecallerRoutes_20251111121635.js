import express from "express"
const router = express.Router()

router.get("/stats", async (req, res) => {
  try {
    const db = req.db
    if (!db) {
      console.error("Database missing on request")
      return res.status(500).json({ error: "Database not available" })
    }

    const callsToday = await db.get(
      "SELECT COUNT(*) as total FROM calls WHERE DATE(created_at) = DATE('now')"
    )
    const conversions = await db.get(
      "SELECT COUNT(*) as total FROM contacts WHERE status = 'converted'"
    )
    const totalContacts = await db.get("SELECT COUNT(*) as total FROM contacts")
    const avgTalkTime = await db.get(
      "SELECT ROUND(AVG(duration), 1) as avg FROM calls"
    )

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
