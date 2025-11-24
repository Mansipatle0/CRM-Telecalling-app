import express from "express";
const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const db = req.db;
    if (!db) {
      console.error("❌ Database not found in req");
      return res.status(500).json({ error: "Database not available" });
    }

    // ===============================
    // 1️⃣ Calls Today
    // ===============================
    const callsToday = await db.query(`
      SELECT COUNT(*) AS total 
      FROM calls 
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // ===============================
    // 2️⃣ Converted Leads Count
    // ===============================
    const conversions = await db.query(`
      SELECT COUNT(*) AS total 
      FROM contacts 
      WHERE status = 'converted'
    `);

    // ===============================
    // 3️⃣ Total Contacts
    // ===============================
    const totalContacts = await db.query(`
      SELECT COUNT(*) AS total 
      FROM contacts
    `);

    // ===============================
    // 4️⃣ Average Call Duration
    // ===============================
    const avgTalkTime = await db.query(`
      SELECT ROUND(AVG(duration), 1) AS avg 
      FROM calls
    `);

    res.json({
      callsToday: callsToday.rows[0]?.total || 0,
      conversions: conversions.rows[0]?.total || 0,
      totalContacts: totalContacts.rows[0]?.total || 0,
      avgTalkTime: avgTalkTime.rows[0]?.avg || 0,
    });
  } catch (err) {
    console.error("Telecaller stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
