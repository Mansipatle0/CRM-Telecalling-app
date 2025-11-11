"use client"

import { useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { ContactList } from "@/components/telecaller/contact-list"
import { CallInterface } from "@/components/telecaller/call-interface"

interface Contact {
  id: number
  name: string
  phone: string
}

export default function TelecallerContactsPage() {
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCallClick = (contactId: number) => {
    setSelectedContactId(contactId)
    // In a real app, you'd fetch the contact details
    setSelectedContact({
      id: contactId,
      name: `Contact ${contactId}`,
      phone: "+1-234-567-8900",
    })
  }

  const handleCallComplete = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <RoleGuard allowedRoles={["telecaller"]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Contacts</h1>
          <p className="text-muted-foreground mt-2">View and manage your assigned contacts</p>
        </div>
        <ContactList key={refreshKey} onCallClick={handleCallClick} />
        {selectedContact && (
          <CallInterface
            contactId={selectedContactId}
            contactName={selectedContact.name}
            contactPhone={selectedContact.phone}
            onClose={() => setSelectedContactId(null)}
            onCallComplete={handleCallComplete}
          />
        )}
      </div>
    </RoleGuard>
  )
}
