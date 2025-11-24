import express from "express"
import multer from "multer"
import * as XLSX from "xlsx"
import { authenticate, authorize } from "../middleware/auth.js"

const router = express.Router()

// ========================================================
// 📤 Multer: File Upload Config (50 MB limit)
// ========================================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

// ========================================================
// 📄 GET ALL CONTACTS
// ========================================================
router.get("/", authenticate, async (req, res) => {
  try {
    let query = "SELECT * FROM contacts"
    const params = []

    if (req.user.role === "telecaller") {
      query += " WHERE assigned_to = $1"
      params.push(req.user.id)
    } 
    else if (req.query.assigned_to) {
      query += " WHERE assigned_to = $1"
      params.push(req.query.assigned_to)
    }

    const contacts = await req.db.query(query, params)
    res.json(contacts.rows)

  } catch (error) {
    console.error("Error fetching contacts:", error)
    res.status(500).json({ error: error.message })
  }
})

// ========================================================
// ➕ CREATE SINGLE CONTACT
// ========================================================
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, email, phone, company, status, source, notes } = req.body

    const assigned_to = 
      req.user.role === "telecaller" ? req.user.id : req.body.assigned_to

    const result = await req.db.query(
      `INSERT INTO contacts 
        (name, email, phone, company, status, assigned_to, source, notes, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW())
       RETURNING *`,
      [
        name, email, phone, company, 
        status || "new", 
        assigned_to, 
        source, 
        notes
      ]
    )

    res.json(result.rows[0])

  } catch (error) {
    console.error("Error creating contact:", error)
    res.status(400).json({ error: error.message })
  }
})

// ========================================================
// 📤 UPLOAD CONTACTS (EXCEL/CSV) - BATCH INSERT
// ========================================================
router.post(
  "/upload",
  authenticate,
  authorize("admin", "manager"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" })

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(worksheet)

      const { assigned_to } = req.body
      let count = 0

      // Prepare rows for batch insert
      const rowsToInsert = data
        .map((row) => {
          const name = row.Name || row.name || row["Full Name"] || row["Contact Name"] || row["Customer Name"]
          const phone = row.Phone || row.phone || row["Mobile"] || row["Mobile Number"] || row["Contact Number"]
          if (!name || !phone) return null

          const email = row.Email || row.email || row["E-mail"] || row["Email Address"] || ""
          const company = row.Company || row.company || row["Company Name"] || row["Organization"] || ""

          return [name, email, phone, company, "new", assigned_to || null, "bulk_upload"]
        })
        .filter(Boolean) // remove invalid rows

      // Batch insert 50 rows at a time
      const batchSize = 50
      for (let i = 0; i < rowsToInsert.length; i += batchSize) {
        const batch = rowsToInsert.slice(i, i + batchSize)
        const values = batch
          .map(
            (_, idx) =>
              `($${idx * 7 + 1}, $${idx * 7 + 2}, $${idx * 7 + 3}, $${idx * 7 + 4}, $${idx * 7 + 5}, $${idx * 7 + 6}, $${idx * 7 + 7})`
          )
          .join(",")

        const flatValues = batch.flat()

        await req.db.query(
          `INSERT INTO contacts 
            (name, email, phone, company, status, assigned_to, source) 
           VALUES ${values}`,
          flatValues
        )

        count += batch.length
      }

      res.json({
        message: "Contacts uploaded successfully",
        count,
      })

    } catch (error) {
      console.error("❌ Upload error:", error)
      res.status(400).json({ error: error.message })
    }
  }
)

// ========================================================
// ✏️ UPDATE CONTACT
// ========================================================
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body

    await req.db.query(
      `UPDATE contacts 
       SET name=$1, email=$2, phone=$3, company=$4, status=$5, notes=$6, updated_at = NOW()
       WHERE id = $7`,
      [name, email, phone, company, status, notes, req.params.id]
    )

    const updated = await req.db.query("SELECT * FROM contacts WHERE id = $1", [req.params.id])
    res.json(updated.rows[0])

  } catch (error) {
    console.error("Error updating contact:", error)
    res.status(500).json({ error: error.message })
  }
})

// ========================================================
// ❌ DELETE CONTACT
// ========================================================
router.delete("/:id", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    await req.db.query("DELETE FROM contacts WHERE id = $1", [req.params.id])
    res.json({ message: "Contact deleted" })
  } catch (error) {
    console.error("Error deleting contact:", error)
    res.status(500).json({ error: error.message })
  }
})

export default router
