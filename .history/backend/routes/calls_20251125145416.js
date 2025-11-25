import express from "express"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// =====================================================
// GET CALLS
// =====================================================
router.get("/", authenticate, async (req, res) => {
  try {
    let query = "SELECT * FROM calls"
    const params = []

    if (req.user.role === "telecaller") {
      query += " WHERE user_id = $1"
      params.push(req.user.id)
    } else if (req.query.user_id) {
      query += " WHERE user_id = $1"
      params.push(req.query.user_id)
    }

    query += " ORDER BY created_at DESC LIMIT 100"

    const result = await req.db.query(query, params)
    res.json(result.rows)

  } catch (error) {
    console.error("GET calls error:", error)
    res.status(500).json({ error: error.message })
  }
})


// =====================================================
// CREATE CALL
// =====================================================
router.post("/", authenticate, async (req, res) => {
  try {
    const { contact_id, duration = 0, status = "completed", notes } = req.body

    // INSERT CALL
    const insertCall = await req.db.query(
      `INSERT INTO calls (contact_id, user_id, duration, status, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [contact_id, req.user.id, duration, status, notes]
    )

    const callId = insertCall.rows[0].id

    // CHECK CONTACT STATUS
    const contactResult = await req.db.query(
      "SELECT status FROM contacts WHERE id = $1",
      [contact_id]
    )

    if (contactResult.rows.length && contactResult.rows[0].status === "new") {
      await req.db.query(
        "UPDATE contacts SET status = 'contacted' WHERE id = $1",
        [contact_id]
      )
    }

    // UPDATE KPI
    await req.db.query(
      `INSERT INTO kpis (user_id, date, calls_made)
       VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (user_id, date)
       DO UPDATE SET calls_made = kpis.calls_made + 1`,
      [req.user.id]
    )

    // RETURN NEW CALL
    const finalCall = await req.db.query(
      "SELECT * FROM calls WHERE id = $1",
      [callId]
    )

    res.json(finalCall.rows[0])

  } catch (error) {
    console.error("CREATE call error:", error)
    res.status(400).json({ error: error.message })
  }
})


// =====================================================
// UPDATE CALL
// =====================================================
// =====================================================
// UPDATE CALL (NOTES ONLY OR FULL UPDATE)
// =====================================================
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { duration, status, notes } = req.body;

    // Get existing call
    const existing = await req.db.query(
      "SELECT * FROM calls WHERE id = $1",
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Call not found" });
    }

    const old = existing.rows[0];

    // If frontend didn't send duration/status → keep old values
    const newDuration = duration ?? old.duration;
    const newStatus = status ?? old.status;
    const newNotes = notes ?? old.notes;

    // Update
    await req.db.query(
      `UPDATE calls
       SET duration = $1,
           status = $2,
           notes = $3,
           updated_at = NOW()
       WHERE id = $4`,
      [newDuration, newStatus, newNotes, req.params.id]
    );

    const updated = await req.db.query(
      "SELECT * FROM calls WHERE id = $1",
      [req.params.id]
    );

    res.json(updated.rows[0]);

  } catch (error) {
    console.error("UPDATE call error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router
