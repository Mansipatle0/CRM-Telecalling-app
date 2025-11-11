import express from "express"
import bcryptjs from "bcryptjs"
import { generateToken, verifyToken } from "../middleware/auth.js"

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role = "telecaller" } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    const result = await req.db.run("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)", [
      email,
      hashedPassword,
      name,
      role,
    ])

    const user = await req.db.get("SELECT id, email, name, role FROM users WHERE id = ?", [result.lastID])

    const token = generateToken(user)

    res.json({ user, token })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    const user = await req.db.get("SELECT * FROM users WHERE email = ?", [email])

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isValidPassword = await bcryptjs.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = generateToken(user)

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Verify token
router.post("/verify", (req, res) => {
  const { token } = req.body
  const decoded = verifyToken(token)

  if (decoded) {
    res.json({ valid: true, user: decoded })
  } else {
    res.status(401).json({ error: "Invalid token" })
  }
})

export default router
