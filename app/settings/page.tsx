"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardFooter } from "@/components/layout/dashboard-footer"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordTips } from "@/components/ui/password-tips"

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [showPasswordTips, setShowPasswordTips] = useState(false)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token")

      if (!token) {
        router.push("/auth/login")
        return
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
        })

        const data = await response.json()

        if (data.status === "success") {
          setUser(data.data.user)
        } else {
          localStorage.removeItem("access_token")
          localStorage.removeItem("user_role")
          localStorage.removeItem("user_id")
          router.push("/auth/login")
        }
      } catch (err) {
        setError("Terjadi kesalahan saat memuat data pengguna")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_role")
    localStorage.removeItem("user_id")
    router.push("/auth/login")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "new_password" && value.length > 0 && !showPasswordTips) {
      setShowPasswordTips(true)
    }
  }

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setChangePasswordLoading(true)
    setError("")
    setSuccess("")

    if (formData.new_password !== formData.confirm_password) {
      setError("Password baru dan konfirmasi password tidak cocok.")
      setChangePasswordLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password,
          confirm_password: formData.confirm_password,
        }),
      })

      const data = await response.json()

      if (data.status === "success") {
        setSuccess("Password berhasil diubah!")
        setFormData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        })
        setShowPasswordTips(false)
      } else {
        if (data.errors) {
          setError(data.errors.map((err: any) => err.message).join(", "))
        } else {
          setError(data.message || "Gagal mengubah password")
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.")
    } finally {
      setChangePasswordLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-8 w-8 text-primary"
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
          <span className="text-lg">Memuat...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
            <p className="text-muted-foreground">Kelola akun dan preferensi keamanan Anda</p>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
              <CardDescription>Detail akun Anda yang terdaftar di sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={user?.email || ""} disabled className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Input value={user?.role || ""} disabled className="mt-1 capitalize" />
                </div>
                <div>
                  <label className="text-sm font-medium">User ID</label>
                  <Input value={user?.id || ""} disabled className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Input value="Aktif" disabled className="mt-1 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>Pastikan akun Anda menggunakan password yang kuat dan unik</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant="success">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="current_password" className="text-sm font-medium">
                    Password Saat Ini
                  </label>
                  <Input
                    id="current_password"
                    name="current_password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.current_password}
                    onChange={handleInputChange}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="new_password" className="text-sm font-medium">
                    Password Baru
                  </label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.new_password}
                    onChange={handleInputChange}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />

                  <PasswordTips
                    password={formData.new_password}
                    isVisible={showPasswordTips}
                    onToggle={() => setShowPasswordTips(!showPasswordTips)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm_password" className="text-sm font-medium">
                    Konfirmasi Password Baru
                  </label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                  {formData.confirm_password && formData.new_password !== formData.confirm_password && (
                    <p className="text-sm text-destructive">Password tidak cocok</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200"
                  disabled={changePasswordLoading}
                >
                  {changePasswordLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Memproses...
                    </div>
                  ) : (
                    "Ubah Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <DashboardFooter />
      <MobileBottomNav user={user} />
    </div>
  )
}
