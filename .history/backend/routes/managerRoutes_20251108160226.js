import express from "express"
import db from "../db.js"

const router = express.Router()

router.get("/analytics", async (req, res) => {
  try {
    const [team] = await db.query(`SELECT COUNT(*) AS total FROM users WHERE role='telecaller'`);
    const [calls] = await db.query(`SELECT COUNT(*) AS total FROM calls`);
    const [converted] = await db.query(`SELECT COUNT(*) AS total FROM contacts WHERE status='converted'`);
    const [uploads] = await db.query(
      `SELECT COUNT(*) AS total FROM contacts WHERE created_at >= CURDATE() - INTERVAL 7 DAY`
    );

    const totalCalls = calls[0]?.total || 0;
    const conversions = converted[0]?.total || 0;

    res.json({
      teamSize: team[0]?.total || 0,
      totalCalls,
      conversions,
      uploads: uploads[0]?.total || 0,
      conversionRate: totalCalls ? ((conversions / totalCalls) * 100).toFixed(1) : 0,
    });
  } catch (err) {
    console.error("Error fetching manager analytics:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router
