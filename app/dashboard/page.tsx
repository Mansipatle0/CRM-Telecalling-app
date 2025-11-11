"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.role === "admin") {
      router.push("/dashboard/admin")
    } else if (user?.role === "manager") {
      router.push("/dashboard/manager")
    } else if (user?.role === "telecaller") {
      router.push("/dashboard/telecaller")
    }
  }, [user, router])

  return null
}
