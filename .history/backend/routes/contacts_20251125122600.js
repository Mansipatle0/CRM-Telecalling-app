import express from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// -----------------------------
// Multer Config (Memory Storage)
// -----------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// -----------------------------
// Normalize Header Keys
// -----------------------------
function normalizeKey(str) {
  return String(str).toLowerCase().replace(/[^a-z0-9]/g, "");
}

// -----------------------------
// GET ALL CONTACTS
// -----------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    let query = "SELECT * FROM contacts";
    const params = [];

    if (req.user.role === "telecaller") {
      query += " WHERE assigned_to = $1";
      params.push(req.user.id);
    } else if (req.query.assigned_to) {
      query += " WHERE assigned_to = $1";
      params.push(req.query.assigned_to);
    }

    const contacts = await req.db.query(query, params);
    res.json(contacts.rows);

  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------
// CREATE SINGLE CONTACT
// -----------------------------
router.post("/", authenticate, async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body;

    const assigned_to =
      req.user.role === "telecaller" ? req.user.id : req.body.assigned_to;

    const result = await req.db.query(
      `INSERT INTO contacts
       (name, email, phone, company, status, assigned_to, source, notes, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,'manual',$7,NOW())
       RETURNING *`,
      [
        name,
        email,
        phone,
        company,
        status || "new",
        assigned_to,
        notes
      ]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(400).json({ error: error.message });
  }
});

// -----------------------------
// 📤 UNIVERSAL EXCEL UPLOAD
// -----------------------------
router.post(
  "/upload",
  authenticate,
  authorize("admin", "manager"),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      if (!rawData.length) {
        return res.json({ message: "No rows found in Excel", count: 0 });
      }

      // --- Normalize Keys ---
      const normalizedData = rawData.map(row => {
        const obj = {};
        for (const key in row) {
          obj[normalizeKey(key)] = row[key];
        }
        return obj;
      });

      const { assigned_to } = req.body;
      let rowsToInsert = [];

      for (const row of normalizedData) {
        const name =
          row.name ||
          row.fullname ||
          row.customername ||
          row.contactname ||
          row.person ||
          row.clientname;

        const phone =
          row.phone ||
          row.phonenumber ||
          row.mobilenumber ||
          row.number ||
          row.contactnumber;

        if (!name || !phone) continue;

        const email = row.email || "";
        const company = row.company || "";

        rowsToInsert.push([
          name,
          email,
          phone,
          company,
          "new",
          assigned_to || null,
          "bulk_upload"
        ]);
      }

      if (!rowsToInsert.length) {
        return res.json({ message: "No valid contacts", count: 0 });
      }

      // --- BATCH INSERT ---
      let count = 0;
      const batchSize = 50;

      for (let i = 0; i < rowsToInsert.length; i += batchSize) {
        const batch = rowsToInsert.slice(i, i + batchSize);

        const values = batch
          .map(
            (_, idx) =>
              `($${idx * 7 + 1},$${idx * 7 + 2},$${idx * 7 + 3},$${idx * 7 + 4},$${idx * 7 + 5},$${idx * 7 + 6},$${idx * 7 + 7})`
          )
          .join(",");

        await req.db.query(
          `INSERT INTO contacts
           (name, email, phone, company, status, assigned_to, source)
           VALUES ${values}`,
          batch.flat()
        );

        count += batch.length;
      }

      res.json({ message: "Contacts uploaded successfully", count });

    } catch (error) {
      console.error("❌ Upload Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// -----------------------------
// UPDATE CONTACT
// -----------------------------
router.patch("/:id", authenticate, async (req, res) => {
  try {
    const { name, email, phone, company, status, notes } = req.body;

    await req.db.query(
      `UPDATE contacts
       SET name=$1, email=$2, phone=$3, company=$4, status=$5, notes=$6, updated_at=NOW()
       WHERE id=$7`,
      [name, email, phone, company, status, notes, req.params.id]
    );

    const updated = await req.db.query(
      "SELECT * FROM contacts WHERE id=$1",
      [req.params.id]
    );

    res.json(updated.rows[0]);

  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------
// DELETE CONTACT
// -----------------------------
router.delete("/:id", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    await req.db.query("DELETE FROM contacts WHERE id=$1", [req.params.id]);
    res.json({ message: "Contact deleted" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
