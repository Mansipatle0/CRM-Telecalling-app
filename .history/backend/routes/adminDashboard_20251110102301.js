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

    res.json({
      totalUsers: totalUsers?.count || 0,
      totalCalls: totalCalls?.count || 0,
      totalContacts: totalContacts?.count || 0,
      conversionRate: conversionRate?.rate || 0,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    res.status(500).json({ error: "Failed to fetch admin dashboard stats" })
  }
})

export default router
