import express from "express"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// 🟩 Get all users (Admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await req.db.all(
      "SELECT id, email, name, role, status, created_at FROM users"
    )
    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ error: error.message })
  }
})

// 🟦 Get team members (Manager or Admin)
router.get("/team", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    const managerId = req.user.role === "admin" ? req.query.manager_id : req.user.id
    const team = await req.db.all(
      "SELECT id, email, name, role, status FROM users WHERE manager_id = ?",
      [managerId]
    )
    res.json(team)
  } catch (error) {
    console.error("Error fetching team:", error)
    res.status(500).json({ error: error.message })
  }
})

// 🟩 Get all active telecallers (for Excel upload assignment)
router.get("/telecallers", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    const telecallers = await req.db.all(
      "SELECT id, name, email FROM users WHERE role = 'telecaller' AND status = 'active'"
    )
    res.json(telecallers)
  } catch (error) {
    console.error("Error fetching telecallers:", error)
    res.status(500).json({ error: error.message })
  }
})

// 🟧 Create a new user (Admin only)
router.post("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" })
    }

    // Check if user already exists
    const existing = await req.db.get("SELECT id FROM users WHERE email = ?", [email])
    if (existing) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Insert new user
    const result = await req.db.run(
      `INSERT INTO users (name, email, password, role, status, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      [name, email, password, role, "active"]
    )

    const newUser = await req.db.get(
      "SELECT id, name, email, role, status, created_at FROM users WHERE id = ?",
      [result.lastID]
    )

    res.status(201).json(newUser)
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({ error: error.message })
  }
})

// 🟨 Update user (Admin only)
router.patch("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, email, role, status, manager_id } = req.body
    const updates = []
    const values = []

    if (name) {
      updates.push("name = ?")
      values.push(name)
    }
    if (email) {
      updates.push("email = ?")
      values.push(email)
    }
    if (role) {
      updates.push("role = ?")
      values.push(role)
    }
    if (status) {
      updates.push("status = ?")
      values.push(status)
    }
    if (manager_id) {
      updates.push("manager_id = ?")
      values.push(manager_id)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" })
    }

    values.push(req.params.id)
    const sql = `UPDATE users SET ${updates.join(", ")}, updated_at = datetime('now') WHERE id = ?`
    await req.db.run(sql, values)

    const updatedUser = await req.db.get(
      "SELECT id, name, email, role, status, created_at FROM users WHERE id = ?",
      [req.params.id]
    )

    res.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ error: error.message })
  }
})

// 🟥 Delete user (Admin only)
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params
    const user = await req.db.get("SELECT id FROM users WHERE id = ?", [id])
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    await req.db.run("DELETE FROM users WHERE id = ?", [id])
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ error: error.message })
  }
})

// ==============================
// 👥 GET ACTIVE TELECALLERS (for Excel upload assign)
// ==============================
router.get("/telecallers", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    const telecallers = await req.db.all(
      "SELECT id, name, email FROM users WHERE role = 'telecaller' AND status = 'active'"
    )
    res.json(telecallers)
  } catch (error) {
    console.error("Error fetching telecallers:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
