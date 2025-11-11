import express from "express"
const router = express.Router()

router.get("/stats", async (req, res) => {
  try {
    const db = req.db

    const totalUsers = await db.get(`SELECT COUNT(*) AS count FROM users`)
    const totalCalls = await db.get(`SELECT COUNT(*) AS count FROM calls`)
    const totalContacts = await db.get(`SELECT COUNT(*) AS count FROM contacts`)
    const conversionRate = await db.get(`
      SELECT 
        ROUND(
          (SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
          2
        ) AS rate
      FROM contacts
    `)

    // Avg Call Duration (fake for now)
    const avgCallDuration = "4m 23s"

    // Weekly call trends
    const recentCalls = await db.all(`
      SELECT 
        strftime('%w', created_at) AS day_index,
        CASE strftime('%w', created_at)
          WHEN '0' THEN 'Sun'
          WHEN '1' THEN 'Mon'
          WHEN '2' THEN 'Tue'
          WHEN '3' THEN 'Wed'
          WHEN '4' THEN 'Thu'
          WHEN '5' THEN 'Fri'
          WHEN '6' THEN 'Sat'
        END AS date,
        COUNT(*) AS count
      FROM calls
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY day_index
      ORDER BY day_index
    `)

    // Contact distribution
    const contactStats = await db.all(`
      SELECT status, COUNT(*) AS value
      FROM contacts
      GROUP BY status
    `)

    res.json({
      totalUsers: totalUsers?.count || 0,
      totalCalls: totalCalls?.count || 0,
      totalContacts: totalContacts?.count || 0,
      conversionRate: conversionRate?.rate || 0,
      avgCallDuration,
      recentCalls,
      contactStats,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    res.status(500).json({ error: "Failed to fetch admin dashboard stats" })
  }
})

export default router
