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
      setLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem("token") // if you require auth
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/telecaller/stats`, {
          method: "GET",
          headers: token ? { "Authorization": `Bearer ${token}` } : undefined,
        })

        // If not OK, read body (could be HTML) and throw helpful error
        if (!res.ok) {
          const text = await res.text()
          console.error("Non-OK response from /api/telecaller/stats:", res.status, text)
          throw new Error(`API returned ${res.status}: ${text.substring(0, 200)}`)
        }

        // Try to parse JSON
        const data = await res.json()
        setStats(data)
      } catch (err: any) {
        console.error("Error fetching telecaller stats:", err)
        setError(err?.message || "Failed to load telecaller stats")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <p className="p-6">Loading dashboard...</p>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>
  if (!stats) return <div className="p-6 text-yellow-600">No stats available</div>

  const conversionRateLabel =
    stats.callsToday > 0
      ? `${((stats.conversions / stats.callsToday) * 100).toFixed(1)}% conversion rate`
      : "No calls yet"

  // avgTalkTime is minutes (adjust formatting if seconds)
  return (
    <RoleGuard allowedRoles={["telecaller"]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Telecaller Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage contacts and track your performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.callsToday}</div>
              <p className="text-xs text-muted-foreground">today calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversions}</div>
              <p className="text-xs text-muted-foreground">{conversionRateLabel}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Talk Time (min)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgTalkTime}</div>
              <p className="text-xs text-muted-foreground">Average per call</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContacts}</div>
              <p className="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>
        </div>

        <CallHistory />
      </div>
    </RoleGuard>
  )
}
