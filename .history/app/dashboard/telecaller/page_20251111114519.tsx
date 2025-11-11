"use client"

import { useEffect, useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { CallHistory } from "@/components/telecaller/call-history"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, PhoneOff, Target, Clock } from "lucide-react"

export default function TelecallerDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:5000/api/telecaller/analytics"),
 {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        setStats(json)
      } catch (err) {
        console.error("Error fetching telecaller stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <p className="p-6">Loading dashboard...</p>
  if (!stats) return <p className="p-6 text-red-500">Failed to load data</p>

  // Convert total talk time (in seconds or minutes) to readable format
  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
  }

  return (
    <RoleGuard allowedRoles={["telecaller"]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Telecaller Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage contacts and track your calling activity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calls Today</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.callsToday}</div>
              <p className="text-xs text-muted-foreground">Daily progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversions}</div>
              <p className="text-xs text-muted-foreground">{stats.conversionRate}% conversion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Talk Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats.talkTime)}</div>
              <p className="text-xs text-muted-foreground">Total time spent on calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacts</CardTitle>
              <PhoneOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.contacts}</div>
              <p className="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>
        </div>

        <CallHistory />
      </div>
    </RoleGuard>
  )
}
