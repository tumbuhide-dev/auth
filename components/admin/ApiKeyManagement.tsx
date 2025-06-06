"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ApiKey {
  id: number
  key_name: string
  key_value?: string
  permissions: string[]
  is_active: boolean
  expires_at: string | null
  last_used_at: string | null
  created_at: string
}

export default function ApiKeyManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyPermissions, setNewKeyPermissions] = useState(["auth"])
  const [newKeyExpiry, setNewKeyExpiry] = useState("")

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch("/api/admin/api-keys", {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
      })

      const data = await response.json()

      if (data.status === "success") {
        setApiKeys(data.data)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError("Failed to fetch API keys")
    } finally {
      setLoading(false)
    }
  }

  const createApiKey = async () => {
    try {
      setError("")
      setSuccess("")

      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({
          key_name: newKeyName,
          permissions: newKeyPermissions,
          expires_at: newKeyExpiry || null,
        }),
      })

      const data = await response.json()

      if (data.status === "success") {
        setSuccess(`API Key berhasil dibuat: ${data.data.key_value}`)
        setShowCreateForm(false)
        setNewKeyName("")
        setNewKeyPermissions(["auth"])
        setNewKeyExpiry("")
        fetchApiKeys()
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError("Failed to create API key")
    }
  }

  const deactivateApiKey = async (id: number) => {
    try {
      setError("")
      setSuccess("")

      const response = await fetch(`/api/admin/api-keys/${id}`, {
        method: "DELETE",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
      })

      const data = await response.json()

      if (data.status === "success") {
        setSuccess("API Key berhasil dinonaktifkan")
        fetchApiKeys()
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError("Failed to deactivate API key")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading API keys...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API Key Management</h2>
          <p className="text-muted-foreground">Kelola API keys untuk akses sistem</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 mr-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create API Key
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>Buat API key baru dengan permissions yang sesuai</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Key Name</label>
              <Input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., production-api-key"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Permissions</label>
              <div className="space-y-2">
                {["auth", "admin", "users", "logs"].map((permission) => (
                  <label key={permission} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newKeyPermissions.includes(permission)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewKeyPermissions([...newKeyPermissions, permission])
                        } else {
                          setNewKeyPermissions(newKeyPermissions.filter((p) => p !== permission))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date (Optional)</label>
              <Input type="datetime-local" value={newKeyExpiry} onChange={(e) => setNewKeyExpiry(e.target.value)} />
            </div>

            <div className="flex space-x-2">
              <Button onClick={createApiKey} disabled={!newKeyName}>
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      <div className="grid gap-4">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{apiKey.key_name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {apiKey.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Status: {apiKey.is_active ? "Active" : "Inactive"}</p>
                    <p>
                      Last Used: {apiKey.last_used_at ? new Date(apiKey.last_used_at).toLocaleDateString() : "Never"}
                    </p>
                    <p>Created: {new Date(apiKey.created_at).toLocaleDateString()}</p>
                    {apiKey.expires_at && <p>Expires: {new Date(apiKey.expires_at).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {apiKey.is_active && (
                    <Button variant="destructive" size="sm" onClick={() => deactivateApiKey(apiKey.id)}>
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {apiKeys.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 mx-auto text-muted-foreground mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
              />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
            <p className="text-muted-foreground mb-4">Belum ada API key yang dibuat</p>
            <Button onClick={() => setShowCreateForm(true)}>Create First API Key</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
