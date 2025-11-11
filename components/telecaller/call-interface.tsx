"use client"

import { useState } from "react"
import { apiCall } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Phone, PhoneMissed } from "lucide-react"

interface CallInterfaceProps {
  contactId: number | null
  contactName?: string
  contactPhone?: string
  onClose: () => void
  onCallComplete: () => void
}

export function CallInterface({ contactId, contactName, contactPhone, onClose, onCallComplete }: CallInterfaceProps) {
  const [isActive, setIsActive] = useState(false)
  const [callStatus, setCallStatus] = useState("pending")
  const [duration, setDuration] = useState(0)
  const [notes, setNotes] = useState("")
  const [contactStatus, setContactStatus] = useState("contacted")

  const handleStartCall = () => {
    setIsActive(true)
    // Simulate call timer
    const interval = setInterval(() => {
      setDuration((d) => d + 1)
    }, 1000)
    return () => clearInterval(interval)
  }

  const handleEndCall = async () => {
    setIsActive(false)
    try {
      await apiCall("/calls", {
        method: "POST",
        body: JSON.stringify({
          contact_id: contactId,
          duration,
          status: "completed",
          notes,
        }),
      })

      await apiCall(`/contacts/${contactId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: contactStatus }),
      })

      onCallComplete()
      setTimeout(() => onClose(), 1500)
    } catch (error) {
      console.error("Failed to log call:", error)
    }
  }

  const handleMissedCall = async () => {
    setIsActive(false)
    try {
      await apiCall("/calls", {
        method: "POST",
        body: JSON.stringify({
          contact_id: contactId,
          status: "missed",
          notes,
        }),
      })
      onCallComplete()
      setTimeout(() => onClose(), 1500)
    } catch (error) {
      console.error("Failed to log missed call:", error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!contactId) return null

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 border-2 border-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-lg">{contactName}</CardTitle>
          <CardDescription>{contactPhone}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isActive && (
          <div className="text-center py-4 bg-primary/10 rounded-lg">
            <div className="text-3xl font-bold text-primary">{formatTime(duration)}</div>
            <div className="text-sm text-muted-foreground mt-1">Call in progress</div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Contact Status</label>
          <Select value={contactStatus} onValueChange={setContactStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Textarea placeholder="Call notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />

        <div className="flex gap-2">
          {!isActive ? (
            <>
              <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700" onClick={handleStartCall}>
                <Phone className="w-4 h-4" />
                Start Call
              </Button>
              <Button variant="outline" className="flex-1 gap-2 bg-transparent" onClick={handleMissedCall}>
                <PhoneMissed className="w-4 h-4" />
                Missed
              </Button>
            </>
          ) : (
            <Button className="w-full gap-2 bg-red-600 hover:bg-red-700" onClick={handleEndCall}>
              <Phone className="w-4 h-4" />
              End Call ({formatTime(duration)})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
