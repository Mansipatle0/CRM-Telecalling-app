import express from "express"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// Get calls
router.get("/", authenticate, async (req, res) => {
  try {
    let query = "SELECT * FROM calls"
    const params = []

    if (req.user.role === "telecaller") {
      query += " WHERE user_id = ?"
      params.push(req.user.id)
    } else if (req.query.user_id) {
      query += " WHERE user_id = ?"
      params.push(req.query.user_id)
    }

    query += " ORDER BY created_at DESC LIMIT 100"

    const calls = await req.db.all(query, params)
    res.json(calls)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create call
router.post("/", authenticate, async (req, res) => {
  try {
    const { contact_id, duration = 0, status = "completed", notes } = req.body

    const result = await req.db.run(
      "INSERT INTO calls (contact_id, user_id, duration, status, notes) VALUES (?, ?, ?, ?, ?)",
      [contact_id, req.user.id, duration, status, notes],
    )

    // Update contact status to 'contacted' if new
    const contact = await req.db.get("SELECT status FROM contacts WHERE id = ?", [contact_id])
    if (contact.status === "new") {
      await req.db.run("UPDATE contacts SET status = ? WHERE id = ?", ["contacted", contact_id])
    }

    // Update KPIs
    const today = new Date().toISOString().split("T")[0]
    await req.db.run(
      `INSERT INTO kpis (user_id, date, calls_made) VALUES (?, ?, 1)
       ON CONFLICT(user_id, date) DO UPDATE SET calls_made = calls_made + 1`,
      [req.user.id, today],
    )

    const call = await req.db.get("SELECT * FROM calls WHERE id = ?", [result.lastID])
    res.json(call)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update call
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { duration, status, notes } = req.body
    await req.db.run(
      "UPDATE calls SET duration = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [duration, status, notes, req.params.id],
    )
    const call = await req.db.get("SELECT * FROM calls WHERE id = ?", [req.params.id])
    res.json(call)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
