import express from "express";
import { pool } from "../db/schema.js"; // adjust path as needed

const router = express.Router();

// Manager Analytics Route
router.get("/analytics", async (req, res) => {
  try {
    // Team Size (telecallers)
    const teamResult = await pool.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'telecaller'"
    );
    const teamSize = Number(teamResult.rows[0]?.total || 0);

    // Total Calls
    const callResult = await pool.query("SELECT COUNT(*) AS total FROM calls");
    const totalCalls = Number(callResult.rows[0]?.total || 0);

    // Converted Leads
    const convertedResult = await pool.query(
      "SELECT COUNT(*) AS total FROM contacts WHERE status = 'converted'"
    );
    const convertedLeads = Number(convertedResult.rows[0]?.total || 0);

    // Avg Conversion %
    const conversionResult = await pool.query(`
      SELECT 
        ROUND((SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) AS rate
      FROM contacts
    `);
    const avgConversion = Number(conversionResult.rows[0]?.rate || 0);

    // Recent Activity (last 10 updates)
    const recentActivity = await pool.query(`
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
