"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, AlertCircle, CheckCircle2, Loader } from "lucide-react"

interface UploadStats {
  successful: number
  failed: number
  total: number
}

interface Telecaller {
  id: number
  name: string
  email: string
}

export function ExcelUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [assignedTo, setAssignedTo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [stats, setStats] = useState<UploadStats | null>(null)
  const [error, setError] = useState("")
  const [telecallers, setTelecallers] = useState<Telecaller[]>([])
  const [loadingTelecallers, setLoadingTelecallers] = useState(true)

  // 🟦 Fetch telecallers from backend
  useEffect(() => {
    const fetchTelecallers = async () => {
      try {
        setLoadingTelecallers(true)
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/telecallers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch telecallers")
        const data = await res.json()
        setTelecallers(data)
      } catch (err) {
        console.error("Error fetching telecallers:", err)
        setError("Failed to load telecallers list")
      } finally {
        setLoadingTelecallers(false)
      }
    }
    fetchTelecallers()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
        setError("Please select an Excel or CSV file")
        return
      }
      setFile(selectedFile)
      setError("")
      setMessage("")
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file")
      return
    }

    setIsLoading(true)
    setMessage("")
    setError("")
    setStats(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (assignedTo && assignedTo !== "unassigned") {
        formData.append("assigned_to", assignedTo)
      }

      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contacts/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const result = await response.json()
      setStats({ successful: result.count, failed: 0, total: result.count })
      setMessage(`Successfully uploaded ${result.count} contacts`)
      setFile(null)
      setAssignedTo("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Excel Upload</CardTitle>
        <CardDescription>Bulk import contacts from Excel or CSV files</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {message && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {/* File Upload Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Select File</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={isLoading}
            className="block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-primary-foreground
              hover:file:bg-primary/90"
          />
          {file && <p className="text-sm text-muted-foreground mt-2">Selected: {file.name}</p>}
        </div>

        {/* Assign To Select */}
        <div>
          <label className="block text-sm font-medium mb-2">Assign To (Optional)</label>

          {loadingTelecallers ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader className="h-4 w-4 animate-spin" />
              Loading telecallers...
            </div>
          ) : telecallers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active telecallers available</p>
          ) : (
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Leave empty to keep unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {telecallers.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name} ({t.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Upload Button */}
        <Button onClick={handleUpload} disabled={!file || isLoading} className="w-full gap-2">
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Contacts
            </>
          )}
        </Button>

        {/* Upload Summary */}
        {stats && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Upload Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{stats.total}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Successful</p>
                <p className="text-lg font-bold text-green-600">{stats.successful}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Failed</p>
                <p className="text-lg font-bold text-red-600">{stats.failed}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-4 text-sm">
          <h4 className="font-semibold text-blue-900 mb-2">File Format</h4>
          <p className="text-blue-800">
            Your Excel file should contain columns: <b>Name</b>, <b>Email</b>, <b>Phone</b>, <b>Company</b>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
