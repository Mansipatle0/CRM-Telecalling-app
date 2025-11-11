import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// Get user dashboard KPIs
router.get("/kpis", authenticate, async (req, res) => {
  try {
    const userId = req.query.user_id || req.user.id

    // Last 30 days
    const kpis = await req.db.all(
      `SELECT * FROM kpis WHERE user_id = ? AND date >= date('now', '-30 days') ORDER BY date DESC`,
      [userId],
    )

    // Today's stats
    const today = new Date().toISOString().split("T")[0]
    const todayStats = await req.db.get("SELECT * FROM kpis WHERE user_id = ? AND date = ?", [userId, today])

    res.json({ kpis, today: todayStats || { calls_made: 0, calls_connected: 0 } })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get team analytics (manager/admin)
router.get("/team", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    const managerId = req.query.manager_id || req.user.id

    const teamStats = await req.db.all(
      `SELECT u.id, u.name, u.email, 
              SUM(k.calls_made) as total_calls,
              SUM(k.calls_converted) as total_converted,
              COUNT(DISTINCT k.date) as active_days
       FROM users u
       LEFT JOIN kpis k ON u.id = k.user_id
       WHERE u.manager_id = ?
       GROUP BY u.id`,
      [managerId],
    )

    res.json(teamStats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get contact statistics
router.get("/contacts", authenticate, async (req, res) => {
  try {
    const stats = await req.db.get(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN status = 'qualified' THEN 1 ELSE 0 END) as qualified,
        SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted,
        SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost
       FROM contacts`,
    )

    res.json(stats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
