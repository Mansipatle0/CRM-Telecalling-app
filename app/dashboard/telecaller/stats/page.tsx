"use client"

import { RoleGuard } from "@/components/role-guard"
import { CallHistory } from "@/components/telecaller/call-history"

export default function TelecallerStatsPage() {
  return (
    <RoleGuard allowedRoles={["telecaller"]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Statistics</h1>
          <p className="text-muted-foreground mt-2">Track your performance metrics</p>
        </div>
        <CallHistory />
      </div>
    </RoleGuard>
  )
}
