"use client"

import { useEffect, useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Phone, Target, TrendingUp } from "lucide-react"

interface ManagerStats {
  teamSize: number
  totalCalls: number
  conversions: number
  uploads: number
  conversionRate: number
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<ManagerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/manager/analytics", {
          credentials: "include",
        })
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error("Error fetching manager stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <RoleGuard allowedRoles={["manager"]}>
        <div className="p-6 text-gray-400">Loading manager dashboard...</div>
      </RoleGuard>
    )
  }

  if (!stats) {
    return (
      <RoleGuard allowedRoles={["manager"]}>
        <div className="p-6 text-red-400">Failed to load data</div>
      </RoleGuard>
    )
  }

  return (
    <RoleGuard allowedRoles={["manager"]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your team and track performance</p>
        </div>

        {/* ==== TOP CARDS ==== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <DashboardCard
            title="Team Size"
            icon={Users}
            value={stats.teamSize}
            subtitle="Active members"
          />
          <DashboardCard
            title="This Week Calls"
            icon={Phone}
            value={stats.totalCalls}
            subtitle="+12% vs last week"
          />
          <DashboardCard
            title="Team Target"
            icon={Target}
            value={`${stats.uploads}`}
            subtitle="Contacts uploaded"
          />
          <DashboardCard
            title="Avg Conversion"
            icon={TrendingUp}
            value={`${stats.conversionRate}%`}
            subtitle="Team average"
          />
        </div>

        {/* ==== LOWER CARDS ==== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RECENT ACTIVITY */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Last 10 team activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Live activity tracking coming soon...</p>
              </div>
            </CardContent>
          </Card>

          {/* QUICK STATS */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your team this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Calls</span>
                  <span className="font-bold">{stats.totalCalls}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Converted Leads</span>
                  <span className="font-bold">{stats.conversions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Conversion Rate</span>
                  <span className="font-bold">{stats.conversionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Recent Uploads</span>
                  <span className="font-bold">{stats.uploads}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  )
}

/* ==== REUSABLE CARD COMPONENT ==== */
function DashboardCard({
  title,
  icon: Icon,
  value,
  subtitle,
}: {
  title: string
  icon: any
  value: string | number
  subtitle: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}
