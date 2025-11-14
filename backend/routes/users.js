import express from "express";
import { pool } from "../db/schema.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// 🟩 Get all users (Admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT id, email, name, role, status, created_at FROM users"
    );

    res.json(users.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟦 Get team members (Manager or Admin)
router.get("/team", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    const managerId =
      req.user.role === "admin" ? req.query.manager_id : req.user.id;

    const team = await pool.query(
      "SELECT id, email, name, role, status FROM users WHERE manager_id = $1",
      [managerId]
    );

    res.json(team.rows);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟩 Get all active telecallers
router.get("/telecallers", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    const telecallers = await pool.query(
      "SELECT id, name, email FROM users WHERE role = 'telecaller' AND status = 'active'"
    );

    res.json(telecallers.rows);
  } catch (error) {
    console.error("Error fetching telecallers:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟧 Create a new user (Admin only)
router.post("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, status, created_at)
       VALUES ($1, $2, $3, $4, 'active', NOW())
       RETURNING id, name, email, role, status, created_at`,
      [name, email, password, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟨 Update user (Admin only)
router.patch("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, email, role, status, manager_id } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push(`name = $${updates.length + 1}`);
      values.push(name);
    }
    if (email) {
      updates.push(`email = $${updates.length + 1}`);
      values.push(email);
    }
    if (role) {
      updates.push(`role = $${updates.length + 1}`);
      values.push(role);
    }
    if (status) {
      updates.push(`status = $${updates.length + 1}`);
      values.push(status);
    }
    if (manager_id) {
      updates.push(`manager_id = $${updates.length + 1}`);
      values.push(manager_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    // Add updated_at column
    updates.push(`updated_at = NOW()`);

    values.push(req.params.id);

    const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = $${values.length} RETURNING id, name, email, role, status, created_at`;

    const result = await pool.query(sql, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟥 Delete user (Admin only)
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await pool.query("SELECT id FROM users WHERE id = $1", [id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
