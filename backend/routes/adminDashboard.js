import express from "express";
import { pool } from "../db/schema.js"; // path adjust kar lena

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    // Total Users
    const totalUsers = await pool.query(`SELECT COUNT(*) AS count FROM users`);
    const totalCalls = await pool.query(`SELECT COUNT(*) AS count FROM calls`);
    const totalContacts = await pool.query(`SELECT COUNT(*) AS count FROM contacts`);

    // Conversion Rate
    const conversionRate = await pool.query(`
      SELECT 
        ROUND(
          (SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END)::decimal * 100) 
          / NULLIF(COUNT(*), 0),
          2
        ) AS rate
      FROM contacts
    `);

    // Weekly call trends (PostgreSQL version)
    const recentCalls = await pool.query(`
      SELECT
        EXTRACT(DOW FROM created_at) AS day_index,
        TO_CHAR(created_at, 'Dy') AS date,
        COUNT(*) AS count
      FROM calls
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day_index, date
      ORDER BY day_index;
    `);

    // Contact distribution
    const contactStats = await pool.query(`
      SELECT status, COUNT(*) AS value
      FROM contacts
      GROUP BY status;
    `);

    res.json({
      totalUsers: totalUsers.rows[0]?.count || 0,
      totalCalls: totalCalls.rows[0]?.count || 0,
      totalContacts: totalContacts.rows[0]?.count || 0,
      conversionRate: conversionRate.rows[0]?.rate || 0,
      avgCallDuration: "4m 23s", // static value
      recentCalls: recentCalls.rows,
      contactStats: contactStats.rows,
    });

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin dashboard stats" });
  }
});

export default router;
import express from "express";
import { pool } from "../db/schema.js"; // path adjust kar lena

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    // Total Users
    const totalUsers = await pool.query(`SELECT COUNT(*) AS count FROM users`);
    const totalCalls = await pool.query(`SELECT COUNT(*) AS count FROM calls`);
    const totalContacts = await pool.query(`SELECT COUNT(*) AS count FROM contacts`);

    // Conversion Rate
    const conversionRate = await pool.query(`
      SELECT 
        ROUND(
          (SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END)::decimal * 100) 
          / NULLIF(COUNT(*), 0),
          2
        ) AS rate
      FROM contacts
    `);

    // Weekly call trends (PostgreSQL version)
    const recentCalls = await pool.query(`
      SELECT
        EXTRACT(DOW FROM created_at) AS day_index,
        TO_CHAR(created_at, 'Dy') AS date,
        COUNT(*) AS count
      FROM calls
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day_index, date
      ORDER BY day_index;
    `);

    // Contact distribution
    const contactStats = await pool.query(`
      SELECT status, COUNT(*) AS value
      FROM contacts
      GROUP BY status;
    `);

    res.json({
      totalUsers: totalUsers.rows[0]?.count || 0,
      totalCalls: totalCalls.rows[0]?.count || 0,
      totalContacts: totalContacts.rows[0]?.count || 0,
      conversionRate: conversionRate.rows[0]?.rate || 0,
      avgCallDuration: "4m 23s", // static value
      recentCalls: recentCalls.rows,
      contactStats: contactStats.rows,
    });

  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin dashboard stats" });
  }
});

export default router;

