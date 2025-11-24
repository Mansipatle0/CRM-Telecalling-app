import express from "express"
import bcryptjs from "bcryptjs"
import { generateToken, verifyToken } from "../middleware/auth.js"

const router = express.Router()

// ============================
// REGISTER
// ============================
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role = "telecaller" } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)

    // INSERT user in PostgreSQL
    const result = await req.db.query(
      `INSERT INTO users (email, password, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role`,
      [email, hashedPassword, name, role]
    )

    const user = result.rows[0]

    const token = generateToken(user)

    res.json({ user, token })

  } catch (error) {
    console.error("Register error:", error)
    res.status(400).json({ error: error.message })
  }
})


// ============================
// LOGIN
// ============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    // Fetch user
    const result = await req.db.query(`SELECT * FROM users WHERE email = $1`, [email])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isValidPassword = await bcryptjs.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = generateToken(user)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
    })

  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: error.message })
  }
})


// ============================
// VERIFY TOKEN
// ============================
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
