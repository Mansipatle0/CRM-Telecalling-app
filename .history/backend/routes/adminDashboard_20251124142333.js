import express from "express"
const router = express.Router()

router.get("/stats", async (req, res) => {
  try {
    const db = req.db

    // ---------- TOTAL COUNTS ----------
    const totalUsersRes = await db.query(`SELECT COUNT(*) AS count FROM users`)
    const totalCallsRes = await db.query(`SELECT COUNT(*) AS count FROM calls`)
    const totalContactsRes = await db.query(`SELECT COUNT(*) AS count FROM contacts`)

    const totalUsers = totalUsersRes.rows[0].count
    const totalCalls = totalCallsRes.rows[0].count
    const totalContacts = totalContactsRes.rows[0].count

    // ---------- CONVERSION RATE ----------
    const conversionRateRes = await db.query(`
      SELECT 
        ROUND(
          (SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) * 100.0) 
          / NULLIF(COUNT(*), 0),
          2
        ) AS rate
      FROM contacts
    `)

    const conversionRate = conversionRateRes.rows[0].rate || 0

    // ---------- AVG CALL DURATION (TEMP STATIC) ----------
    const avgCallDuration = "4m 23s"

    // ---------- WEEKLY CALL TRENDS ----------
    // PostgreSQL uses TO_CHAR + EXTRACT(DOW)
    const recentCallsRes = await db.query(`
      SELECT
        EXTRACT(DOW FROM created_at) AS day_index,
        TO_CHAR(created_at, 'Dy') AS date,
        COUNT(*) AS count
      FROM calls
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day_index, date
      ORDER BY day_index;
    `)

    const recentCalls = recentCallsRes.rows

    // ---------- CONTACT DISTRIBUTION ----------
    const contactStatsRes = await db.query(`
      SELECT status, COUNT(*) AS value
      FROM contacts
      GROUP BY status;
    `)

    const contactStats = contactStatsRes.rows

    return res.json({
      totalUsers,
      totalCalls,
      totalContacts,
      conversionRate,
      avgCallDuration,
      recentCalls,
      contactStats
    })

  } catch (error) {
    console.error("Error fetching admin stats:", error)
    res.status(500).json({ error: "Failed to fetch admin dashboard stats" })
  }
})

export default router
