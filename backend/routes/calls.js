import express from "express";
import { authenticate } from "../middleware/auth.js";
import { pool } from "../db/schema.js"; // adjust path if needed

const router = express.Router();

// -----------------------------------------------------
// GET CALLS
// -----------------------------------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    let query = `SELECT * FROM calls`;
    const params = [];

    if (req.user.role === "telecaller") {
      query += ` WHERE user_id = $1`;
      params.push(req.user.id);
    } else if (req.query.user_id) {
      query += ` WHERE user_id = $1`;
      params.push(req.query.user_id);
    }

    query += ` ORDER BY created_at DESC LIMIT 100`;

    const calls = await pool.query(query, params);
    res.json(calls.rows);
  } catch (error) {
    console.error("GET CALLS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------------------------------
// CREATE CALL
// -----------------------------------------------------
router.post("/", authenticate, async (req, res) => {
  try {
    const { contact_id, duration = 0, status = "completed", notes } = req.body;

    // Insert call
    const result = await pool.query(
      `INSERT INTO calls (contact_id, user_id, duration, status, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [contact_id, req.user.id, duration, status, notes]
    );

    const call = result.rows[0];

    // Update contact status if new
    const contact = await pool.query(
      `SELECT status FROM contacts WHERE id = $1`,
      [contact_id]
    );

    if (contact.rows[0]?.status === "new") {
      await pool.query(
        `UPDATE contacts SET status = 'contacted' WHERE id = $1`,
        [contact_id]
      );
    }

    // Update KPIs
    const today = new Date().toISOString().split("T")[0];

    await pool.query(
      `INSERT INTO kpis (user_id, date, calls_made)
       VALUES ($1, $2, 1)
       ON CONFLICT (user_id, date)
       DO UPDATE SET calls_made = kpis.calls_made + 1`,
      [req.user.id, today]
    );

    res.json(call);
  } catch (error) {
    console.error("CREATE CALL ERROR:", error);
    res.status(400).json({ error: error.message });
  }
});

// -----------------------------------------------------
// UPDATE CALL
// -----------------------------------------------------
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { duration, status, notes } = req.body;

    await pool.query(
      `UPDATE calls
       SET duration = $1, status = $2, notes = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [duration, status, notes, req.params.id]
    );

    const updatedCall = await pool.query(
      `SELECT * FROM calls WHERE id = $1`,
      [req.params.id]
    );

    res.json(updatedCall.rows[0]);
  } catch (error) {
    console.error("UPDATE CALL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
