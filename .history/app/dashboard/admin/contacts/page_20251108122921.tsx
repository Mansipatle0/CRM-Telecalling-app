"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Contact {
  id: number
  name: string
  email: string
  phone: string
  company?: string
  status?: string
  assigned_to?: number | null
  source?: string
  created_at?: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch contacts")
      const data = await res.json()
      setContacts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error fetching contacts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>All Contacts</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchContacts}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader className="h-5 w-5 animate-spin mr-2" />
            Loading contacts...
          </div>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : contacts.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No contacts found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>{c.company || "-"}</TableCell>
                    <TableCell>{c.status || "-"}</TableCell>
                    <TableCell>{c.source || "-"}</TableCell>
                    <TableCell>{c.assigned_to || "Unassigned"}</TableCell>
                    <TableCell>
                      {c.created_at
                        ? new Date(c.created_at).toLocaleDateString()
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
