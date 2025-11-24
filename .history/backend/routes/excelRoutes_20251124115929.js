import express from "express";
import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const router = express.Router();
const excelFolder = path.join(process.cwd(), "uploads/excel");

// List all Excel files
router.get("/list", (req, res) => {
  try {
    const files = fs.readdirSync(excelFolder);
    const excelFiles = files.filter(f => f.endsWith(".xlsx") || f.endsWith(".xls"));
    res.json(excelFiles);
  } catch (err) {
    res.status(500).json({ error: "Unable to read excel folder" });
  }
});

// Read Excel file
router.get("/read/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(excelFolder, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Unable to read excel file" });
  }
});

// Delete Excel file
router.delete("/delete/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(excelFolder, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    fs.unlinkSync(filePath);

    res.json({ success: true, message: "File deleted" });
  } catch (err) {
    res.status(500).json({ error: "Unable to delete file" });
  }
});

export default router;
