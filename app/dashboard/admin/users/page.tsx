"use client"

import { RoleGuard } from "@/components/role-guard"
import { UserManagement } from "@/components/admin/user-management"

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">Manage system users, roles, and permissions</p>
        </div>
        <UserManagement />
      </div>
    </RoleGuard>
  )
}
