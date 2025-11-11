"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function TeamOverview() {
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://localhost:5000/api/manager/team", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await res.json()
        setTeam(data)
      } catch (err) {
        console.error("Error fetching team:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [])

  if (loading) return <p className="p-4">Loading team...</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {team.map((member) => (
        <Card key={member.id}>
          <CardHeader>
            <CardTitle>{member.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </CardHeader>
          <CardContent>
            <p><strong>Role:</strong> {member.role}</p>
            <p><strong>Total Calls:</strong> {member.total_calls}</p>
            <p><strong>Conversions:</strong> {member.conversions}</p>
            <p><strong>Performance:</strong> {member.performance || "N/A"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
