import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// 🧠 Admin Analytics
router.get("/admin", authenticate, authorize("admin"), async (req, res) => {
  try {
    const weeklyData = await req.db.all(`
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
        COUNT(*) AS newContacts,
        SUM(CASE WHEN status = 'interested' OR status = 'converted' THEN 1 ELSE 0 END) AS conversions
      FROM contacts
      WHERE created_at >= datetime('now', '-7 days')
      GROUP BY day_index
      ORDER BY day_index
    `)

    // Fake call data for visualization (if no call table yet)
    const data = weeklyData.map(row => ({
      ...row,
      calls: Math.floor(row.newContacts * 5 + Math.random() * 100) // simulate call count
    }))

    res.json(data)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
