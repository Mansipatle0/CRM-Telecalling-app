import express from "express";

const router = express.Router();

// Manager Analytics Route (PostgreSQL)
router.get("/analytics", async (req, res) => {
  try {
    const db = req.db;

    // ================================
    // 1️⃣ Team Size (telecaller count)
    // ================================
    const teamResult = await db.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'telecaller'"
    );
    const teamSize = teamResult.rows[0]?.total || 0;

    // ================================
    // 2️⃣ Total Calls
    // ================================
    const callResult = await db.query(
      "SELECT COUNT(*) AS total FROM calls"
    );
    const totalCalls = callResult.rows[0]?.total || 0;

    // ================================
    // 3️⃣ Converted Leads
    // ================================
    const convertedResult = await db.query(
      "SELECT COUNT(*) AS total FROM contacts WHERE status = 'converted'"
    );
    const convertedLeads = convertedResult.rows[0]?.total || 0;

    // ================================
    // 4️⃣ Average Conversion %
    // ================================
    const conversionResult = await db.query(`
      SELECT 
        ROUND(
          (SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END)::float 
          * 100.0 / NULLIF(COUNT(*), 0)), 1
        ) AS rate
      FROM contacts
    `);
    const avgConversion = conversionResult.rows[0]?.rate || 0;

    // ================================
    // 5️⃣ Recent Activity (Last 10)
    // ================================
    const recentActivity = await db.query(`
      SELECT name, status, updated_at 
      FROM contacts
      ORDER BY updated_at DESC 
      LIMIT 10
    `);

    res.json({
      teamSize,
      totalCalls,
      convertedLeads,
      avgConversion,
      recentActivity: recentActivity.rows,
    });
  } catch (err) {
    console.error("Manager analytics error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
