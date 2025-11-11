import express from "express"

const router = express.Router()

// Manager Analytics Route
router.get("/analytics", async (req, res) => {
  try {
    const db = req.db

    // Team Size (telecallers)
    const teamResult = await db.get("SELECT COUNT(*) as total FROM users WHERE role = 'telecaller'")
    const teamSize = teamResult?.total || 0

    // Total Calls
    const callResult = await db.get("SELECT COUNT(*) as total FROM calls")
    const totalCalls = callResult?.total || 0

    // Converted Leads
    const convertedResult = await db.get("SELECT COUNT(*) as total FROM contacts WHERE status = 'converted'")
    const convertedLeads = convertedResult?.total || 0

    // Avg Conversion %
    const conversionResult = await db.get(`
      SELECT 
        ROUND((SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) AS rate
      FROM contacts
    `)
    const avgConversion = conversionResult?.rate || 0

    // Recent Activity (last 10 updates)
    const recentActivity = await db.all(`
      SELECT name, status, updated_at 
      FROM contacts 
      ORDER BY updated_at DESC 
      LIMIT 10
    `)

    res.json({
      teamSize,
      totalCalls,
      convertedLeads,
      avgConversion,
      recentActivity,
    })
  } catch (err) {
    console.error("Manager analytics error:", err)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router
