"use client"

import { useState, useEffect } from "react"
import { apiCall } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface User {
  id: number
  email: string
  name: string
  role: string
  status: string
  created_at: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Add User form state
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newRole, setNewRole] = useState("telecaller")
  const [creating, setCreating] = useState(false)

  // Edit user state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await apiCall("/users")
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId: number, status: string) => {
    try {
      await apiCall(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      fetchUsers()
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const handleCreateUser = async () => {
    if (!newName || !newEmail || !newPassword || !newRole) {
      alert("All fields are required")
      return
    }

    setCreating(true)
    try {
      const data = await apiCall("/users", {
        method: "POST",
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      })
      console.log("User created:", data)
      fetchUsers()
      setDialogOpen(false)
      setNewName("")
      setNewEmail("")
      setNewPassword("")
      setNewRole("telecaller")
    } catch (err) {
      console.error("Failed to create user:", err)
      alert("Failed to create user")
    } finally {
      setCreating(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditUser(user)
    setEditDialogOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!editUser) return
    setUpdating(true)
    try {
      await apiCall(`/users/${editUser.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
          status: editUser.status,
        }),
      })
      fetchUsers()
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Failed to update user:", error)
      alert("Failed to update user")
    } finally {
      setUpdating(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: "bg-red-500",
      manager: "bg-blue-500",
      telecaller: "bg-green-500",
    }
    return colors[role as keyof typeof colors] || "bg-gray-500"
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage all system users and their roles</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input type="email" placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <Input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="telecaller">Telecaller</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleCreateUser} disabled={creating}>
                {creating ? "Creating..." : "Create User"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="flex gap-2">
                    <Select
                      value={user.status}
                      onValueChange={(status) => handleStatusChange(user.id, status)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {loading && <p className="mt-4 text-center text-gray-500">Loading users...</p>}
        </div>
      </CardContent>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Name"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />
              <Input
                placeholder="Email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
              <Select
                value={editUser.role}
                onValueChange={(role) => setEditUser({ ...editUser, role })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="telecaller">Telecaller</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={editUser.status}
                onValueChange={(status) => setEditUser({ ...editUser, status })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleUpdateUser} disabled={updating}>
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
