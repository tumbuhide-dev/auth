"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("processing")
  const [message, setMessage] = useState("Memproses...")
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = () => {
      const hash = window.location.hash
      console.log("🔍 Auth callback hash:", hash)

      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const type = params.get("type")
        const accessToken = params.get("access_token")
        const refreshToken = params.get("refresh_token")

        console.log("📋 Callback params:", { type, accessToken: !!accessToken, refreshToken: !!refreshToken })

        if (type === "recovery") {
          // Password reset flow
          setStatus("success")
          setMessage("Link reset password valid. Mengalihkan ke halaman reset password...")

          setTimeout(() => {
            router.push(`/auth/reset-password${hash}`)
          }, 2000)
        } else if (type === "signup") {
          // Email verification flow
          setStatus("success")
          setMessage("Email berhasil diverifikasi. Mengalihkan ke halaman login...")

          setTimeout(() => {
            router.push("/auth/login")
          }, 2000)
        } else {
          setStatus("error")
          setMessage("Tipe callback tidak dikenali.")
        }
      } else {
        setStatus("error")
        setMessage("Parameter callback tidak ditemukan.")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {status === "processing" && "⏳ Memproses..."}
            {status === "success" && "✅ Berhasil"}
            {status === "error" && "❌ Error"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>

        {status === "processing" && (
          <div className="flex justify-center">
            <svg
              className="animate-spin h-8 w-8 text-indigo-600"
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
          </div>
        )}

        {status === "error" && (
          <div className="mt-4">
            <a href="/auth/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Kembali ke Login
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
