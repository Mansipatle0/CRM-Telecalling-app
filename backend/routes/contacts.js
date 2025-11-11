import express from "express"
import multer from "multer"
import * as XLSX from "xlsx"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// ==============================
// 📄 GET ALL CONTACTS
// ==============================
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
    console.error("Error fetching contacts:", error)
    res.status(500).json({ error: error.message })
  }
})

// ==============================
// ➕ CREATE SINGLE CONTACT
// ==============================
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, email, phone, company, status, source, notes } = req.body
    const assigned_to = req.user.role === "telecaller" ? req.user.id : req.body.assigned_to

    const result = await req.db.run(
      "INSERT INTO contacts (name, email, phone, company, status, assigned_to, source, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))",
      [name, email, phone, company, status || "new", assigned_to, source, notes]
    )

    const contact = await req.db.get("SELECT * FROM contacts WHERE id = ?", [result.lastID])
    res.json(contact)
  } catch (error) {
    console.error("Error creating contact:", error)
    res.status(400).json({ error: error.message })
  }
})

// ==============================
// 📤 UPLOAD CONTACTS (EXCEL/CSV)
// ==============================
router.post("/upload", authenticate, authorize("admin", "manager"), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" })

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    console.log("📊 Parsed Excel Data:", data.slice(0, 5)) // Log first 5 rows for debugging

    const { assigned_to } = req.body
    let count = 0

    for (const row of data) {
      const name =
        row.Name ||
        row.name ||
        row["Full Name"] ||
        row["Contact Name"] ||
        row["Customer Name"]
      const email =
        row.Email ||
        row.email ||
        row["E-mail"] ||
        row["Email Address"] ||
        ""
      const phone =
        row.Phone ||
        row.phone ||
        row["Mobile"] ||
        row["Mobile Number"] ||
        row["Contact Number"]
      const company =
        row.Company ||
        row.company ||
        row["Company Name"] ||
        row["Organization"] ||
        ""

      if (!name || !phone) continue // skip invalid rows

      await req.db.run(
        "INSERT INTO contacts (name, email, phone, company, status, assigned_to, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
        [name, email, phone, company, "new", assigned_to || null, "bulk_upload"]
      )

      count++
    }

    res.json({
      message: "Contacts uploaded successfully",
      count,
    })
  } catch (error) {
    console.error("❌ Upload error:", error)
    res.status(400).json({ error: error.message })
  }
})

// ==============================
// ✏️ UPDATE CONTACT
// ==============================
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body
    await req.db.run(
      "UPDATE contacts SET name = ?, email = ?, phone = ?, company = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, email, phone, company, status, notes, req.params.id]
    )

    const contact = await req.db.get("SELECT * FROM contacts WHERE id = ?", [req.params.id])
    res.json(contact)
  } catch (error) {
    console.error("Error updating contact:", error)
    res.status(500).json({ error: error.message })
  }
})

// ==============================
// ❌ DELETE CONTACT
// ==============================
router.delete("/:id", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    await req.db.run("DELETE FROM contacts WHERE id = ?", [req.params.id])
    res.json({ message: "Contact deleted" })
  } catch (error) {
    console.error("Error deleting contact:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
