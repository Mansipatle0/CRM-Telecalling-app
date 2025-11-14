import express from "express";
import { pool } from "../db/schema.js"; // adjust path if needed

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    // Calls Today
    const callsToday = await pool.query(
      "SELECT COUNT(*) AS total FROM calls WHERE DATE(created_at) = CURRENT_DATE"
    );

    // Total Conversions
    const conversions = await pool.query(
      "SELECT COUNT(*) AS total FROM contacts WHERE status = 'converted'"
    );

    // Total Contacts
    const totalContacts = await pool.query(
      "SELECT COUNT(*) AS total FROM contacts"
    );

    // Average Talk Time (duration)
    const avgTalkTime = await pool.query(
      "SELECT ROUND(AVG(duration), 1) AS avg FROM calls"
    );

    res.json({
      callsToday: Number(callsToday.rows[0]?.total || 0),
      conversions: Number(conversions.rows[0]?.total || 0),
      totalContacts: Number(totalContacts.rows[0]?.total || 0),
      avgTalkTime: Number(avgTalkTime.rows[0]?.avg || 0),
    });
  } catch (err) {
    console.error("Telecaller stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
