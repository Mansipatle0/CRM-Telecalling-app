import express from "express"
import multer from "multer"
import XLSX from "xlsx"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Get all contacts
router.get("/", authenticate, async (req, res) => {
  try {
    let query = "SELECT * FROM contacts"
    const params = []

    if (req.user.role === "telecaller") {
      query += " WHERE assigned_to = ?"
      params.push(req.user.id)
    } else if (req.query.assigned_to) {
      query += " WHERE assigned_to = ?"
      params.push(req.query.assigned_to)
    }

    const contacts = await req.db.all(query, params)
    res.json(contacts)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create contact
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, email, phone, company, status, source, notes } = req.body
    const assigned_to = req.user.role === "telecaller" ? req.user.id : req.body.assigned_to

    const result = await req.db.run(
      "INSERT INTO contacts (name, email, phone, company, status, assigned_to, source, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, phone, company, status || "new", assigned_to, source, notes],
    )

    const contact = await req.db.get("SELECT * FROM contacts WHERE id = ?", [result.lastID])
    res.json(contact)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Upload contacts (Excel)
router.post("/upload", authenticate, authorize("admin", "manager"), upload.single("file"), async (req, res) => {
  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    const { assigned_to } = req.body
    const insertedContacts = []

    for (const row of data) {
      const result = await req.db.run(
        "INSERT INTO contacts (name, email, phone, company, status, assigned_to, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [row.name, row.email, row.phone, row.company, "new", assigned_to || null, "bulk_upload"],
      )
      insertedContacts.push(result.lastID)
    }

    res.json({ message: "Contacts uploaded", count: insertedContacts.length })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update contact
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body
    await req.db.run(
      "UPDATE contacts SET name = ?, email = ?, phone = ?, company = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, email, phone, company, status, notes, req.params.id],
    )
    const contact = await req.db.get("SELECT * FROM contacts WHERE id = ?", [req.params.id])
    res.json(contact)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete contact
router.delete("/:id", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    await req.db.run("DELETE FROM contacts WHERE id = ?", [req.params.id])
    res.json({ message: "Contact deleted" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

const upload = multer({ dest: "uploads/" })

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" })

    // Read Excel or CSV file
    const workbook = XLSX.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])

    // Insert each contact
    let count = 0
    for (const row of sheet) {
      const { Name, Email, Phone, Company } = row
      if (!Name || !Phone) continue // skip invalid rows

      await req.db.run(
        "INSERT INTO contacts (name, email, phone, company, status, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))",
        [Name, Email || "", Phone, Company || "", "new"]
      )
      count++
    }

    res.json({ count })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ error: error.message })
  }
})


export default router
