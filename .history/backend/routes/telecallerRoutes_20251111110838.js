import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// Telecaller Dashboard Stats
router.get("/stats", authenticate, authorize("telecaller"), async (req, res) => {
  try {
    const db = req.db
    const userId = req.user.id // from JWT after authentication

    // Calls made today
    const callsToday = await db.get(`
      SELECT COUNT(*) AS count 
      FROM calls 
      WHERE user_id = ? 
      AND DATE(timestamp) = DATE('now')
    `, [userId])

    // Conversions today
    const conversions = await db.get(`
      SELECT COUNT(*) AS count 
      FROM contacts 
      WHERE assigned_to = ? 
      AND status = 'converted' 
      AND DATE(updated_at) = DATE('now')
    `, [userId])

    // Total talk time (sum of duration)
    const talkTime = await db.get(`
      SELECT IFNULL(SUM(duration), 0) AS total 
      FROM calls 
      WHERE user_id = ?
    `, [userId])

    // Total contacts assigned
    const contacts = await db.get(`
      SELECT COUNT(*) AS count 
      FROM contacts 
      WHERE assigned_to = ?
    `, [userId])

    // Conversion rate
    const conversionRate = await db.get(`
      SELECT 
        ROUND(
          (SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
          2
        ) AS rate
      FROM contacts
      WHERE assigned_to = ?
    `, [userId])

    res.json({
      callsToday: callsToday?.count || 0,
      conversions: conversions?.count || 0,
      talkTime: talkTime?.total || 0,
      contacts: contacts?.count || 0,
      conversionRate: conversionRate?.rate || 0,
    })
  } catch (err) {
    console.error("Error fetching telecaller stats:", err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
