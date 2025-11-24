import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// 🟩 Get all users (Admin only)
router.get("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const result = await req.db.query(`
      SELECT id, email, name, role, status, created_at 
      FROM users
    `);

    res.json(result.rows);
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

    const result = await req.db.query(
      `SELECT id, email, name, role, status 
       FROM users 
       WHERE manager_id = $1`,
      [managerId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟩 Get all active telecallers
router.get("/telecallers", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    const result = await req.db.query(`
      SELECT id, name, email 
      FROM users 
      WHERE role = 'telecaller' AND status = 'active'
    `);

    res.json(result.rows);
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
    const existing = await req.db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Insert
    const insert = await req.db.query(
      `INSERT INTO users (name, email, password, role, status, created_at)
       VALUES ($1, $2, $3, $4, 'active', NOW())
       RETURNING id, name, email, role, status, created_at`,
      [name, email, password, role]
    );

    res.status(201).json(insert.rows[0]);
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
    let i = 1;

    if (name) {
      updates.push(`name = $${i++}`);
      values.push(name);
    }
    if (email) {
      updates.push(`email = $${i++}`);
      values.push(email);
    }
    if (role) {
      updates.push(`role = $${i++}`);
      values.push(role);
    }
    if (status) {
      updates.push(`status = $${i++}`);
      values.push(status);
    }
    if (manager_id) {
      updates.push(`manager_id = $${i++}`);
      values.push(manager_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    values.push(req.params.id);

    await req.db.query(
      `UPDATE users SET ${updates.join(", ")}, updated_at = NOW() 
       WHERE id = $${i}`,
      values
    );

    const updated = await req.db.query(
      `SELECT id, name, email, role, status, created_at 
       FROM users 
       WHERE id = $1`,
      [req.params.id]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
});

// 🟥 Delete user
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    const check = await req.db.query(
      "SELECT id FROM users WHERE id = $1",
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await req.db.query("DELETE FROM users WHERE id = $1", [id]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
