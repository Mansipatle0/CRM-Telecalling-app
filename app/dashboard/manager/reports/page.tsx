"use client"

import { RoleGuard } from "@/components/role-guard"
import { CallTracking } from "@/components/manager/call-tracking"

export default function ManagerReportsPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-2">Call tracking and team analytics</p>
        </div>
        <CallTracking />
      </div>
    </RoleGuard>
  )
}
