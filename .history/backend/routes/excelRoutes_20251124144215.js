import express from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ================================
// 📤 Upload Excel → Save to Postgres
// ================================
router.post(
  "/upload",
  authenticate,
  authorize("admin", "manager"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      let count = 0;

      for (const row of rows) {
        const name = row.name || row.Name || row["Full Name"];
        const phone = row.phone || row.Phone || row["Mobile Number"];
        const email = row.email || row.Email || "";
        const company = row.company || row.Company || "";

        if (!name || !phone) continue;

        await req.db.query(
          `INSERT INTO contacts (name, email, phone, company, status, source) 
           VALUES ($1, $2, $3, $4, 'new', 'excel_upload')`,
          [name, email, phone, company]
        );

        count++;
      }

      res.json({
        success: true,
        message: `Successfully uploaded ${count} contacts.`,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error uploading Excel" });
    }
  }
);

// ================================
// 📄 Get All Contacts (View Excel Data)
// ================================
router.get("/list", authenticate, async (req, res) => {
  try {
    const result = await req.db.query(
      `SELECT id, name, phone, email, company, status, created_at 
       FROM contacts ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// ================================
// ❌ Delete a Contact
// ================================
router.delete("/delete/:id", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    await req.db.query(`DELETE FROM contacts WHERE id = $1`, [req.params.id]);
    res.json({ success: true, message: "Contact deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
