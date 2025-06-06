"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  const [status, setStatus] = useState("processing")
  const [message, setMessage] = useState("Memproses verifikasi...")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleVerification = async () => {
      const token = searchParams?.get("token")
      const type = searchParams?.get("type")
      const redirectTo = searchParams?.get("redirect_to")

      if (!token) {
        setStatus("error")
        setMessage("Token verifikasi tidak ditemukan.")
        return
      }

      if (type === "recovery") {
        // Password reset flow
        setStatus("success")
        setMessage("Link reset password valid. Mengalihkan ke halaman reset password...")

        // Redirect ke halaman reset password dengan token
        setTimeout(() => {
          router.push(`/auth/reset-password?token=${token}`)
        }, 2000)
      } else if (type === "signup") {
        // Email verification flow
        try {
          // Verifikasi email dengan token
          const response = await fetch("/api/auth/verify-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
            },
            body: JSON.stringify({ token }),
          })

          const data = await response.json()

          if (data.status === "success") {
            setStatus("success")
            setMessage("Email berhasil diverifikasi. Mengalihkan ke halaman login...")

            setTimeout(() => {
              router.push("/auth/login")
            }, 2000)
          } else {
            setStatus("error")
            setMessage(data.message || "Verifikasi email gagal.")
          }
        } catch (error) {
          setStatus("error")
          setMessage("Terjadi kesalahan saat verifikasi email.")
        }
      } else {
        setStatus("error")
        setMessage("Tipe verifikasi tidak dikenali.")
      }
    }

    handleVerification()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                {status === "processing" && (
                  <svg
                    className="animate-spin h-6 w-6 text-white dark:text-white"
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
                )}
                {status === "success" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 text-white dark:text-white"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                {status === "error" && (
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
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {status === "processing" && "Memproses Verifikasi"}
              {status === "success" && "Verifikasi Berhasil"}
              {status === "error" && "Verifikasi Gagal"}
            </CardTitle>
            <CardDescription className="text-base">{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "processing" && (
              <div className="flex justify-center">
                <div className="w-12 h-1 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary animate-progress"></div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {status === "error" && (
              <div className="space-y-2 w-full">
                <Link href="/auth/login" className="block w-full">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-200">
                    Kembali ke Login
                  </Button>
                </Link>
                <Link href="/auth/forgot-password" className="block w-full">
                  <Button variant="outline" className="w-full">
                    Request Reset Password Lagi
                  </Button>
                </Link>
              </div>
            )}
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
