import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateApiKey } from "@/lib/middleware/validate-api-key"
import { rateLimit } from "@/lib/middleware/rate-limit"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"
import { z } from "zod"

const resetPasswordTokenSchema = z
  .object({
    token: z.string().min(1, { message: "Token tidak valid" }),
    new_password: z
      .string()
      .min(8, { message: "Password baru minimal 8 karakter" })
      .regex(/[A-Z]/, { message: "Password baru harus mengandung minimal 1 huruf besar" })
      .regex(/[0-9]/, { message: "Password baru harus mengandung minimal 1 angka" }),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Password baru dan konfirmasi password tidak cocok",
    path: ["confirm_password"],
  })

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKeyError = await validateApiKey(req)
    if (apiKeyError) return apiKeyError

    // Apply rate limiting (5 requests per hour)
    const rateLimitError = await rateLimit(req, 5, 3600)
    if (rateLimitError) return rateLimitError

    // Parse request body
    const body = await req.json()

    // Validate input
    const validationResult = resetPasswordTokenSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Validasi gagal",
          errors: validationResult.error.errors,
        },
        { status: 200 },
      )
    }

    const { token, new_password } = validationResult.data

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    console.log("🔄 Attempting to verify OTP and update password...")

    // Verify OTP token dan update password sekaligus
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
    })

    if (error) {
      console.error("❌ OTP verification failed:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Token reset password tidak valid atau sudah expired",
        },
        { status: 200 },
      )
    }

    console.log("✅ OTP verified, updating password...")

    // Update password menggunakan session yang baru dibuat
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    })

    if (updateError) {
      console.error("❌ Password update failed:", updateError)
      return createErrorResponse(updateError)
    }

    console.log("✅ Password updated successfully")

    // Log activity
    if (data.user) {
      await logActivity(data.user.id, "reset_password", {}, req)
    }

    return NextResponse.json({
      status: "success",
      message: "Password berhasil diperbarui. Silakan login dengan password baru Anda.",
    })
  } catch (error) {
    console.error("💥 Reset password token error:", error)
    return createErrorResponse(error)
  }
}
