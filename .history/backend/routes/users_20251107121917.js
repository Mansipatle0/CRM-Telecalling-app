import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// Get all users (admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await req.db.all("SELECT id, email, name, role, status, created_at FROM users")
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get team members (manager view)
router.get("/team", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    const managerId = req.user.role === "admin" ? req.query.manager_id : req.user.id
    const team = await req.db.all("SELECT id, email, name, role, status FROM users WHERE manager_id = ?", [managerId])
    res.json(team)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update user
router.patch("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { status, manager_id } = req.body
    await req.db.run("UPDATE users SET status = ?, manager_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [
      status,
      manager_id,
      req.params.id,
    ])
    const user = await req.db.get("SELECT id, email, name, role, status FROM users WHERE id = ?", [req.params.id])
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
