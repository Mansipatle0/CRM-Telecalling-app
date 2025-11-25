"use client"

import { useEffect, useState } from "react"
import { apiCall } from "@/lib/api-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Call {
  id: number
  contact_id: number
  duration: number
  status: string
  notes?: string
  created_at: string
}

export function CallHistory() {
  const [calls, setCalls] = useState<Call[]>([])
  const [stats, setStats] = useState({ total: 0, today: 0, avgDuration: 0 })

  // Notes edit state
  const [editOpen, setEditOpen] = useState(false)
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [editNotes, setEditNotes] = useState("")

  useEffect(() => {
    fetchCalls()
  }, [])

  const fetchCalls = async () => {
    try {
      const data = await apiCall("/calls")
      setCalls(data)

      // Stats
      const total = data.length
      const today = data.filter((c: Call) => {
        const callDate = new Date(c.created_at)
        const today = new Date()
        return callDate.toDateString() === today.toDateString()
      }).length

      const avgDuration =
        data.length > 0 ? Math.round(data.reduce((sum: number, c: Call) => sum + c.duration, 0) / data.length) : 0

      setStats({ total, today, avgDuration })
    } catch (error) {
      console.error("Failed to fetch calls:", error)
    }
  }

  const handleEditNotes = (call: Call) => {
    setSelectedCall(call)
    setEditNotes(call.notes || "")
    setEditOpen(true)
  }

  const saveNotes = async () => {
    if (!selectedCall) return
    try {
      await apiCall(`/calls/${selectedCall.id}`, {
        method: "PATCH",
        body: JSON.stringify({ notes: editNotes }),
      })
      setEditOpen(false)
      fetchCalls()
    } catch (error) {
      console.error("Failed to update notes:", error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      missed: "bg-orange-100 text-orange-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>Your recent calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact ID</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.slice(0, 20).map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="font-medium">#{call.contact_id}</TableCell>
                    <TableCell>{formatDuration(call.duration)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(call.status)}>{call.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                    </TableCell>

                    <TableCell className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{call.notes || "—"}</span>

                      <Dialog open={editOpen} onOpenChange={setEditOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditNotes(call)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Notes</DialogTitle>
                          </DialogHeader>

                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="mt-2"
                          />

                          <Button className="mt-4 w-full" onClick={saveNotes}>
                            Save
                          </Button>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
