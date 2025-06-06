import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { validateApiKey } from "@/lib/middleware/validate-api-key"
import { createErrorResponse } from "@/lib/utils/error-handler"
import { logActivity } from "@/lib/utils/logger"
import { z } from "zod"

const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: "Token tidak valid" }),
})

export async function POST(req: NextRequest) {
  try {
    // Validate API key
    const apiKeyError = await validateApiKey(req)
    if (apiKeyError) return apiKeyError

    // Parse request body
    const body = await req.json()

    // Validate input
    const validationResult = verifyEmailSchema.safeParse(body)
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

    const { token } = validationResult.data

    // Create Supabase client
    const supabase = createServerSupabaseClient()

    // Verify email dengan token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "signup",
    })

    if (error) {
      console.error("Email verification error:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Token verifikasi tidak valid atau sudah expired",
        },
        { status: 200 },
      )
    }

    // Update user status to active
    if (data.user) {
      await supabase
        .from("users")
        .update({
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user.id)

      // Log activity
      await logActivity(data.user.id, "email_verified", { email: data.user.email }, req)
    }

    return NextResponse.json({
      status: "success",
      message: "Email berhasil diverifikasi. Anda sekarang dapat login.",
    })
  } catch (error) {
    return createErrorResponse(error)
  }
}
