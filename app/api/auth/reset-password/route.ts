import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateApiKey } from "@/lib/middleware/validate-api-key"
import { rateLimit } from "@/lib/middleware/rate-limit"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"
import { z } from "zod"

const resetPasswordSchema = z
  .object({
    access_token: z.string().min(1, { message: "Access token tidak valid" }),
    refresh_token: z.string().min(1, { message: "Refresh token tidak valid" }),
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
    const validationResult = resetPasswordSchema.safeParse(body)
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

    const { access_token, refresh_token, new_password } = validationResult.data

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Set session dengan token dari email
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (sessionError || !sessionData.user) {
      return NextResponse.json(
        {
          status: "error",
          message: "Token reset password tidak valid atau sudah expired",
        },
        { status: 200 },
      )
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password,
    })

    if (updateError) {
      return createErrorResponse(updateError)
    }

    // Log activity
    await logActivity(sessionData.user.id, "reset_password", {}, req)

    return NextResponse.json({
      status: "success",
      message: "Password berhasil diperbarui. Silakan login dengan password baru Anda.",
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
