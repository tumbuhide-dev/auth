import { NextResponse } from "next/server"

export type ErrorType = {
  code?: string
  message: string
  details?: any
}

export const errorHandler = (error: any): ErrorType => {
  console.error("Error:", error)

  // Handle Supabase errors
  if (error?.code) {
    switch (error.code) {
      case "invalid_credentials":
        return { code: error.code, message: "Email atau password salah" }
      case "email_not_confirmed":
        return { code: error.code, message: "Email belum diverifikasi" }
      case "signup_disabled":
        return { code: error.code, message: "Pendaftaran tidak diizinkan" }
      case "email_address_invalid":
        return { code: error.code, message: "Format email tidak valid" }
      case "password_too_short":
        return { code: error.code, message: "Password terlalu pendek (minimal 8 karakter)" }
      case "user_already_exists":
        return { code: error.code, message: "Email sudah digunakan" }
      case "same_password":
        return { code: error.code, message: "Password baru tidak boleh sama dengan password lama" }
      case "weak_password":
        return { code: error.code, message: "Password terlalu lemah. Gunakan kombinasi huruf besar, kecil, dan angka" }
      case "23505": // PostgreSQL unique violation
        return { code: error.code, message: "Data sudah ada" }
      case "rate_limit_exceeded":
        return { code: error.code, message: "Terlalu banyak percobaan. Silakan tunggu beberapa menit" }
      default:
        return {
          code: error.code,
          message: "Terjadi kesalahan. Silakan coba lagi nanti.",
          details: process.env.NODE_ENV === "development" ? error : undefined,
        }
    }
  }

  // Handle other errors
  return {
    message: "Terjadi kesalahan. Silakan coba lagi nanti.",
    details: process.env.NODE_ENV === "development" ? error : undefined,
  }
}

export const createErrorResponse = (error: any) => {
  const errorData = errorHandler(error)

  return NextResponse.json(
    {
      status: "error",
      message: errorData.message,
      ...(errorData.code && { code: errorData.code }),
      ...(errorData.details && { details: errorData.details }),
    },
    { status: 200 },
  )
}
