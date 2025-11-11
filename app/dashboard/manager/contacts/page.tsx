"use client"

import { RoleGuard } from "@/components/role-guard"
import { ExcelUpload } from "@/components/admin/excel-upload"

export default function AdminContactsPage() {
  return (
    <RoleGuard allowedRoles={["admin", "manager"]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Upload</h1>
          <p className="text-muted-foreground mt-2">
            Upload Excel or CSV files to add multiple contacts at once
          </p>
        </div>

        <ExcelUpload />
      </div>
    </RoleGuard>
  )
}
