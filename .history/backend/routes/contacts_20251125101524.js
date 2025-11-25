import express from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

// -----------------------------
// Multer Config
// -----------------------------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// -----------------------------
// Normalize Header Function
// -----------------------------
function normalize(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ""); // remove spaces/symbols
}

// -----------------------------
// Get Column Value (Smart Match)
// -----------------------------
function smartValue(row, keyList) {
  const normalizedRow = {};

  // Convert row keys to normalized keys
  for (const key in row) {
    normalizedRow[normalize(key)] = row[key];
  }

  // Try finding matching key
  for (const key of keyList) {
    const norm = normalize(key);
    if (normalizedRow[norm] !== undefined) {
      return normalizedRow[norm];
    }
  }

  return "";
}

// -----------------------------
// Excel Upload API
// -----------------------------
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
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data.length) {
        return res.json({ message: "No rows found", count: 0 });
      }

      const { assigned_to } = req.body;
      let count = 0;

      const rowsToInsert = data
        .map((row) => {
          const name = smartValue(row, [
            "name",
            "fullname",
            "customername",
            "contactname",
            "person",
            "candidate",
            "clientname"
          ]);

          const phone = smartValue(row, [
            "phone",
            "phoneno",
            "number",
            "mobile",
            "mobileno",
            "contact",
            "whatsapp",
            "caller",
            "landlineno"
          ]);

          if (!name || !phone) return null;

          const email = smartValue(row, [
            "email",
            "mail",
            "emailaddress"
          ]);

          const company = smartValue(row, [
            "company",
            "companyname",
            "business",
            "organization",
            "firm"
          ]);

          return [
            name,
            email,
            phone,
            company,
            "new",
            assigned_to || null,
            "bulk_upload"
          ];
        })
        .filter(Boolean);

      // Batch Insert
      const batchSize = 50;
      for (let i = 0; i < rowsToInsert.length; i += batchSize) {
        const batch = rowsToInsert.slice(i, i + batchSize);

        const values = batch
          .map(
            (_, idx) =>
              `($${idx * 7 + 1}, $${idx * 7 + 2}, $${idx * 7 + 3}, $${idx * 7 + 4},
                $${idx * 7 + 5}, $${idx * 7 + 6}, $${idx * 7 + 7})`
          )
          .join(",");

        const flatValues = batch.flat();

        await req.db.query(
          `INSERT INTO contacts
           (name, email, phone, company, status, assigned_to, source)
           VALUES ${values}`,
          flatValues
        );

        count += batch.length;
      }

      res.json({ message: "Contacts uploaded successfully", count });

    } catch (error) {
      console.error("Upload error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
