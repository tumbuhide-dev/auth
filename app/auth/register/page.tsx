"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordTips } from "@/components/ui/password-tips"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    repassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPasswordTips, setShowPasswordTips] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (success && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (success && countdown === 0) {
      router.push("/auth/login")
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [success, countdown, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "password" && value.length > 0 && !showPasswordTips) {
      setShowPasswordTips(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const apiKey = process.env.NEXT_PUBLIC_API_KEY

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey || "",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.status === "success") {
        setSuccess(data.message)
      } else {
        if (data.errors) {
          setError(data.errors.map((err: any) => err.message).join(", "))
        } else {
          setError(data.message || "Registrasi gagal")
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
        <div className="w-full max-w-md">
          <Card className="border-border shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-white dark:text-white"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Pendaftaran Berhasil!</CardTitle>
              <CardDescription className="text-base">{success}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Mohon periksa email Anda <span className="font-medium">{formData.email}</span> untuk mengonfirmasi
                pendaftaran.
              </p>
              <Alert variant="success" className="bg-primary/10 text-primary border-primary/20">
                <AlertDescription>
                  Anda akan dialihkan ke halaman login dalam <span className="font-bold">{countdown}</span> detik...
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200"
              >
                Lanjut ke Halaman Login
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                <Link href="/" className="text-primary hover:underline font-medium">
                  Kembali ke Beranda
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-white dark:text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Daftar Akun</CardTitle>
            <CardDescription>Buat akun baru untuk mengakses layanan kami</CardDescription>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />

                <PasswordTips
                  password={formData.password}
                  isVisible={showPasswordTips}
                  onToggle={() => setShowPasswordTips(!showPasswordTips)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="repassword" className="text-sm font-medium">
                  Konfirmasi Password
                </label>
                <Input
                  id="repassword"
                  name="repassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.repassword}
                  onChange={handleInputChange}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                {formData.repassword && formData.password !== formData.repassword && (
                  <p className="text-sm text-destructive">Password tidak cocok</p>
                )}
              </div>

              <p className="text-sm text-muted-foreground text-center mt-4">
                Dengan mendaftar, Anda menyetujui syarat dan ketentuan yang berlaku.
              </p>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
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
                  "Daftar"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Login di sini
              </Link>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              <Link href="/" className="text-primary hover:underline font-medium">
                Kembali ke Beranda
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
