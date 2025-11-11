import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

// ✅ Use Inter font (since Geist is unavailable locally)
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CRM & Telecalling App",
  description: "Professional CRM and Telecalling Management System",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* ✅ Apply the Inter font class here */}
      <body className={`${inter.className} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
