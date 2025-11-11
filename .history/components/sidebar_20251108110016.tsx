"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, Users, PhoneCall, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"

const dashboards = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/admin" },
    { icon: Users, label: "Users", href: "/dashboard/admin/users" },
    
    { icon: BarChart3, label: "Analytics", href: "/dashboard/admin/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/admin/settings" },
    { icon: Upload Contacts, label: "Settings", href: "/dashboard/admin/settings" },
  ],
  manager: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/manager" },
    { icon: Users, label: "Team", href: "/dashboard/manager/team" },
    { icon: BarChart3, label: "Reports", href: "/dashboard/manager/reports" },
  ],
  telecaller: [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard/telecaller" },
    { icon: PhoneCall, label: "Contacts", href: "/dashboard/telecaller/contacts" },
    { icon: BarChart3, label: "My Stats", href: "/dashboard/telecaller/stats" },
  ],
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  // Safe handling if user is null
  const links = user ? dashboards[user.role as keyof typeof dashboards] || [] : []

  return (
    <aside className="w-64 bg-slate-900 border-r border-gray-800 h-screen flex flex-col">
      {/* Top logo / title */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-6 h-6 text-white" />
          <div>
            <h1 className="font-bold text-lg text-white">CRM Suite</h1>
            <p className="text-xs text-white/70 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-700 hover:text-white"
              >
                <Icon className="w-4 h-4 mr-3 text-white" />
                {link.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* User info & logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-white font-medium">{user?.name}</p>
          <p className="text-xs text-white/70">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent text-white border-white hover:bg-white hover:text-black"
          onClick={() => {
            logout()
            router.push("/login")
          }}
        >
          <LogOut className="w-4 h-4 mr-3 text-white" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
