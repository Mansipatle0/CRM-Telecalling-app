import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { pool } from "../db/schema.js"; // adjust path if needed

const router = express.Router();

// 🧠 Admin Analytics
router.get("/admin", authenticate, authorize("admin"), async (req, res) => {
  try {
    const weeklyData = await pool.query(`
      SELECT 
        EXTRACT(DOW FROM created_at) AS day_index,
        TO_CHAR(created_at, 'Dy') AS date,
        COUNT(*) AS newcontacts,
        SUM(
          CASE 
            WHEN status = 'interested' OR status = 'converted' 
            THEN 1 ELSE 0 
          END
        ) AS conversions
      FROM contacts
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day_index, date
      ORDER BY day_index;
    `);

    // Fake call data (same as before)
    const data = weeklyData.rows.map(row => ({
      ...row,
      calls: Math.floor(row.newcontacts * 5 + Math.random() * 100)
    }));

    res.json(data);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
