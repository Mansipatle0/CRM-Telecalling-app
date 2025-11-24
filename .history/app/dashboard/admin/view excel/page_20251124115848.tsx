"use client";

import { useEffect, useState } from "react";

export default function ViewExcel() {
  const [files, setFiles] = useState<string[]>([]);
  const [excelData, setExcelData] = useState<any[]>([]);

  // Load file names
  const loadFiles = async () => {
    const res = await fetch("http://localhost:5000/api/excel/list");
    const data = await res.json();
    setFiles(data);
  };

  // Read file
  const readFile = async (name: string) => {
    const res = await fetch(`http://localhost:5000/api/excel/read/${name}`);
    const data = await res.json();
    setExcelData(data);
  };

  // Delete file
  const deleteFile = async (name: string) => {
    await fetch(`http://localhost:5000/api/excel/delete/${name}`, {
      method: "DELETE",
    });
    loadFiles();
    setExcelData([]);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Excel Files</h1>

      {/* File List */}
      <ul className="border p-3 rounded w-80">
        {files.map((file) => (
          <li key={file} className="flex justify-between items-center border-b py-2">
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => readFile(file)}
            >
              {file}
            </span>
            <button
              className="text-red-600"
              onClick={() => deleteFile(file)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* Excel Data Table */}
      {excelData.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Excel Data</h2>

          <table className="w-full border">
            <thead>
              <tr>
                {Object.keys(excelData[0]).map((col) => (
                  <th key={col} className="border p-2 bg-gray-100">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((value: any, j) => (
                    <td key={j} className="border p-2">
                      {value?.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
