"use client"

import { useEffect, useState } from "react"
import { apiCall } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export function CallStatistics() {
  const [kpis, setKpis] = useState<any[]>([])
  const [todayStats, setTodayStats] = useState({ calls_made: 0, calls_connected: 0 })

  useEffect(() => {
    fetchKpis()
  }, [])

  const fetchKpis = async () => {
    try {
      const data = await apiCall("/analytics/kpis")
      setKpis(data.kpis)
      setTodayStats(data.today)
    } catch (error) {
      console.error("Failed to fetch KPIs:", error)
    }
  }

  const chartData = kpis
    .slice(0, 7)
    .reverse()
    .map((kpi) => ({
      date: new Date(kpi.date).toLocaleDateString("en-US", { weekday: "short" }),
      calls: kpi.calls_made,
      converted: kpi.calls_converted,
      talkTime: Math.round((kpi.total_talk_time || 0) / 60),
    }))

  const callDistribution = [
    { name: "Completed", value: todayStats.calls_connected, color: "#10b981" },
    { name: "Pending", value: Math.max(0, todayStats.calls_made - todayStats.calls_connected), color: "#f59e0b" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayStats.calls_made}</div>
            <p className="text-xs text-muted-foreground">Connected: {todayStats.calls_connected}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {todayStats.calls_made > 0 ? Math.round((todayStats.calls_connected / todayStats.calls_made) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">7-Day Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(kpis.reduce((sum, k) => sum + k.calls_made, 0) / Math.max(kpis.length, 1))}
            </div>
            <p className="text-xs text-muted-foreground">Calls per day</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trend</CardTitle>
            <CardDescription>Calls and conversions over 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="calls" stroke="#3b82f6" name="Calls Made" />
                <Line type="monotone" dataKey="converted" stroke="#10b981" name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Talk Time Distribution</CardTitle>
            <CardDescription>Daily talk time in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="talkTime" fill="#8b5cf6" name="Talk Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Call Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={callDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {callDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
