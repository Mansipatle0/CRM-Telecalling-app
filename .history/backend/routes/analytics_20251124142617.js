import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// 🧠 Admin Analytics
router.get("/admin", authenticate, authorize("admin"), async (req, res) => {
  try {
    const db = req.db

    const weeklyDataRes = await db.query(`
      SELECT 
        EXTRACT(DOW FROM created_at) AS day_index,
        TO_CHAR(created_at, 'Dy') AS date,
        COUNT(*) AS "newContacts",
        SUM(CASE WHEN status IN ('interested', 'converted') THEN 1 ELSE 0 END) AS conversions
      FROM contacts
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day_index, date
      ORDER BY day_index;
    `)

    let weeklyData = weeklyDataRes.rows

    // Fake call simulation (optional)
    const data = weeklyData.map(row => ({
      ...row,
      calls: Math.floor(row.newContacts * 5 + Math.random() * 100)
    }))

    res.json(data)

  } catch (error) {
    console.error("Error fetching analytics:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
