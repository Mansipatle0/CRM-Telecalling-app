"use client"

import { useEffect, useState } from "react"
import { apiCall } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TeamMember {
  id: number
  name: string
  email: string
  total_calls?: number
  total_converted?: number
  active_days?: number
}

export function TeamOverview() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    try {
      const data = await apiCall("/users/team")
      setTeam(data)
    } catch (error) {
      console.error("Failed to fetch team:", error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = team.map((member) => ({
    name: member.name.split(" ")[0],
    calls: member.total_calls || 0,
    converted: member.total_converted || 0,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Individual metrics across your team</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="calls" fill="#3b82f6" />
              <Bar dataKey="converted" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>View your team's performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Calls</TableHead>
                  <TableHead>Converted</TableHead>
                  <TableHead>Active Days</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => {
                  const conversionRate = member.total_calls
                    ? Math.round(((member.total_converted || 0) / member.total_calls) * 100)
                    : 0
                  const performanceLevel = conversionRate > 20 ? "green" : conversionRate > 10 ? "yellow" : "red"

                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.total_calls || 0}</TableCell>
                      <TableCell>{member.total_converted || 0}</TableCell>
                      <TableCell>{member.active_days || 0}</TableCell>
                      <TableCell>
                        <Badge variant={performanceLevel === "green" ? "default" : "secondary"}>
                          {conversionRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
