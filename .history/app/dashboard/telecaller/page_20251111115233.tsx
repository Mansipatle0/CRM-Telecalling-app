"use client"

import { useEffect, useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Target, Clock, Users } from "lucide-react"
import { CallHistory } from "@/components/telecaller/call-history"

interface TelecallerStats {
  callsToday: number
  conversions: number
  totalContacts: number
  avgTalkTime: number
}

export default function TelecallerDashboard() {
  const [stats, setStats] = useState<TelecallerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/telecaller/stats")
        if (!res.ok) throw new Error(`Failed: ${res.status}`)
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error("Error fetching telecaller stats:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <p className="p-6">Loading dashboard...</p>
  if (error || !stats) return <p className="p-6 text-red-500">{error}</p>

  return (
    <RoleGuard allowedRoles={["telecaller"]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Telecaller Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage contacts and track your performance</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.callsToday}</div>
              <p className="text-xs text-muted-foreground">Target: 20</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.callsToday > 0
                  ? `${((stats.conversions / stats.callsToday) * 100).toFixed(1)}% conversion rate`
                  : "No calls yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Talk Time (min)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgTalkTime}</div>
              <p className="text-xs text-muted-foreground">Average per call</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContacts}</div>
              <p className="text-xs text-muted-foreground">Total assigned</p>
            </CardContent>
          </Card>
        </div>

        {/* Call History Table */}
        <CallHistory />
      </div>
    </RoleGuard>
  )
}
