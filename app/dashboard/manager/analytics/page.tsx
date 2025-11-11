"use client"

import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const teamData = [
  { name: "John", calls: 45, converted: 9, rate: "20%" },
  { name: "Sarah", calls: 52, converted: 13, rate: "25%" },
  { name: "Mike", calls: 38, converted: 6, rate: "16%" },
  { name: "Emma", calls: 48, converted: 10, rate: "21%" },
]

export default function ManagerAnalyticsPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Team Analytics</h1>
          <p className="text-muted-foreground mt-2">Detailed performance metrics for your team</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Performance Comparison</CardTitle>
            <CardDescription>Calls made vs conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calls" fill="#3b82f6" name="Calls Made" />
                <Bar dataKey="converted" fill="#10b981" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {teamData.map((member) => (
            <Card key={member.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{member.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-2xl font-bold">{member.calls}</p>
                  <p className="text-xs text-muted-foreground">Calls: {member.converted} converted</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">{member.rate}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </RoleGuard>
  )
}
